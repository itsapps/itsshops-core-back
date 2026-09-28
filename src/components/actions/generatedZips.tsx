/**
 * withGeneratedZips — keeps a `generatedZip` field in sync with a set of source
 * assets, on publish. Schema-agnostic: the customer's `collect(doc)` returns the
 * targets (which assets → which zip field), so this isn't tied to any module type.
 *
 * On publish, for each target:
 *   - hash the (sorted) source asset ids; if it matches the stored hash and a
 *     file already exists → skip (no work),
 *   - otherwise fetch the originals, build a *store-mode* zip in the browser
 *     (`client-zip`, lazy-imported), upload it as a file asset, patch the draft
 *     (file + hash + generatedAt), then delete the replaced asset (no orphans).
 * Then the original publish runs, committing the patched draft.
 *
 * Usage (customer sanity.config.ts):
 *   documentActions: withGeneratedZips({ types: ['page'], collect })
 */
import { useToast } from '@sanity/ui/toast'
import { useState } from 'react'
import type {
  DocumentActionComponent,
  DocumentActionProps,
  DocumentActionsContext,
  SanityClient,
} from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'

export type ZipPathSegment = string | number | { _key: string }

export type ZipTarget = {
  /** Path to the `generatedZip` field, incl. keyed array segments, e.g. ['modules', {_key}, 'groups', {_key}, 'generatedZip']. */
  path: ZipPathSegment[]
  /** Source assets in order. `name` = desired entry base name (without extension); falls back to the original filename. */
  assets: { id: string; name?: string }[]
  /** Filename for the produced zip. */
  filename: string
}

export type GeneratedZipsOptions = {
  /** Document types this applies to. */
  types: string[]
  /** Return the zip targets for a document (empty → nothing happens). */
  collect: (doc: Record<string, any>) => ZipTarget[]
  /**
   * How many superseded zips to keep alive per target so already-deployed static
   * links keep resolving until the next site build. Default 3. Set higher if you
   * publish many times between manual rebuilds.
   */
  retainStale?: number
}

// ── path helpers ───────────────────────────────────────────────────────────

function pathToString(path: ZipPathSegment[]): string {
  let out = ''
  for (const seg of path) {
    if (typeof seg === 'string') out += out ? `.${seg}` : seg
    else if (typeof seg === 'number') out += `[${seg}]`
    else out += `[_key=="${seg._key}"]`
  }
  return out
}

function getAtPath(doc: any, path: ZipPathSegment[]): any {
  let cur = doc
  for (const seg of path) {
    if (cur == null) return undefined
    if (typeof seg === 'object') cur = Array.isArray(cur) ? cur.find((x) => x?._key === seg._key) : undefined
    else cur = cur[seg as any]
  }
  return cur
}

/** Stable non-crypto hash (djb2) of the assets (id + entry name), so renaming
 *  a source (e.g. a changed title) also regenerates the zip. */
function hashAssets(assets: { id: string; name?: string }[]): string {
  const str = assets.map((a) => `${a.id}:${a.name ?? ''}`).sort().join('|')
  let h = 5381
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i)
  return (h >>> 0).toString(16)
}

// ── sync ───────────────────────────────────────────────────────────────────

/** Regenerate changed zips + patch the draft. Returns the replaced asset ids to
 *  clean up *after* publish (they're still referenced by the published doc now). */
async function syncZips(
  client: SanityClient,
  props: DocumentActionProps,
  options: GeneratedZipsOptions,
): Promise<string[]> {
  const doc = props.draft ?? props.published
  if (!doc) return []
  const targets = options.collect(doc)
  if (!targets.length) return []

  const retain = Math.max(0, options.retainStale ?? 3)

  type Patch = { base: string; ref: string; hash: string; stale: string[] }
  const patches: Patch[] = []
  const oldAssetIds: string[] = []

  for (const target of targets) {
    const specs = (target.assets ?? []).filter((a) => a?.id)
    if (!specs.length) continue

    const existing = getAtPath(doc, target.path)
    const newHash = hashAssets(specs)
    if (existing?.hash === newHash && existing?.file?.asset?._ref) continue // unchanged → skip

    // fetch originals (url + original filename), keyed by id
    const ids = specs.map((s) => s.id)
    const fetched = await client.fetch<Array<{ _id: string; url: string; originalFilename?: string }>>(
      `*[_id in $ids]{ _id, url, originalFilename }`,
      { ids },
    )
    const byId = new Map(fetched.map((a) => [a._id, a]))

    // name each entry by its desired base + original extension, de-duplicated
    const seen = new Map<string, number>()
    const metas: { name: string; url: string }[] = []
    for (const spec of specs) {
      const a = byId.get(spec.id)
      if (!a?.url) continue
      const ext = (
        a.originalFilename?.split('.').pop() ||
        a.url.split('?')[0].split('.').pop() ||
        ''
      ).toLowerCase()
      const base = spec.name || a.originalFilename?.replace(/\.[^.]+$/, '') || 'image'
      let name = ext ? `${base}.${ext}` : base
      const n = seen.get(name) ?? 0
      seen.set(name, n + 1)
      if (n > 0) name = ext ? `${base}-${n + 1}.${ext}` : `${base}-${n + 1}`
      metas.push({ name, url: a.url })
    }
    if (!metas.length) continue

    const files = await Promise.all(
      metas.map(async (m) => ({ name: m.name, input: await fetch(m.url) })),
    )

    const { downloadZip } = await import('client-zip')
    const blob = await downloadZip(files).blob()
    const uploaded = await client.assets.upload('file', blob, { filename: target.filename })

    // Keep the last `retain` superseded zips alive (deployed static links may
    // still point at them until the next build); delete anything older.
    const oldRef = existing?.file?.asset?._ref
    const prevStale: string[] = Array.isArray(existing?.staleAssetIds) ? existing.staleAssetIds : []
    const queue = [oldRef, ...prevStale].filter(Boolean) as string[]
    const keptStale = queue.slice(0, retain)
    oldAssetIds.push(...queue.slice(retain)) // overflow → delete after publish

    patches.push({ base: pathToString(target.path), ref: uploaded._id, hash: newHash, stale: keptStale })
  }

  if (!patches.length) return []

  const draftId = doc._id?.startsWith('drafts.') ? doc._id : `drafts.${props.id}`
  const now = new Date().toISOString()
  let tx = client.patch(draftId)
  for (const p of patches) {
    tx = tx.set({
      [`${p.base}.file`]: { _type: 'file', asset: { _type: 'reference', _ref: p.ref } },
      [`${p.base}.hash`]: p.hash,
      [`${p.base}.generatedAt`]: now,
      [`${p.base}.staleAssetIds`]: p.stale,
    })
  }
  await tx.commit({ visibility: 'sync' })

  return oldAssetIds
}

/**
 * Delete replaced zip assets. Called after publish, but the published doc may
 * still reference them until publish propagates — so retry through the
 * "asset in use" window before giving up.
 */
async function cleanupAssets(client: SanityClient, ids: string[], attempts = 6, delayMs = 1500) {
  for (const id of ids) {
    for (let i = 0; i < attempts; i++) {
      try {
        await client.delete(id)
        break
      } catch {
        if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs))
      }
    }
  }
}

// ── action wrapper ───────────────────────────────────────────────────────────

export function withGeneratedZips(options: GeneratedZipsOptions) {
  return (actions: DocumentActionComponent[], context: DocumentActionsContext): DocumentActionComponent[] => {
    if (!options.types.includes(context.schemaType)) return actions

    return actions.map((Action) => {
      if (Action.action !== 'publish') return Action

      const Wrapped: DocumentActionComponent = (props) => {
        const origin = Action(props)
        const { sanityClient } = useITSContext()
        const toast = useToast()
        const [busy, setBusy] = useState(false)
        if (!origin) return origin

        return {
          ...origin,
          disabled: busy || origin.disabled,
          onHandle: async () => {
            let oldAssetIds: string[] = []
            try {
              setBusy(true)
              oldAssetIds = await syncZips(sanityClient, props, options)
            } catch (err) {
              toast.push({
                status: 'error',
                title: 'ZIP generation failed',
                description: err instanceof Error ? err.message : String(err),
              })
            } finally {
              setBusy(false)
            }
            // publish first — the old zip assets are still referenced by the
            // published doc until this completes …
            origin.onHandle?.()
            // … then delete them once dereferenced (retries through propagation).
            if (oldAssetIds.length) void cleanupAssets(sanityClient, oldAssetIds)
          },
        }
      }
      Wrapped.action = Action.action
      return Wrapped
    })
  }
}
