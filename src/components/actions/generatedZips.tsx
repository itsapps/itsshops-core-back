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
  /** Source asset _ids to include, in order. */
  assetIds: string[]
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

/** Stable non-crypto hash (djb2) of the sorted asset ids. */
function hashAssetIds(ids: string[]): string {
  const str = [...ids].sort().join('|')
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
    const ids = target.assetIds.filter(Boolean)
    if (!ids.length) continue

    const existing = getAtPath(doc, target.path)
    const newHash = hashAssetIds(ids)
    if (existing?.hash === newHash && existing?.file?.asset?._ref) continue // unchanged → skip

    // fetch originals (url + name), preserve target order
    const assets = await client.fetch<Array<{ _id: string; url: string; originalFilename?: string }>>(
      `*[_id in $ids]{ _id, url, originalFilename }`,
      { ids },
    )
    const byId = new Map(assets.map((a) => [a._id, a]))
    const files = await Promise.all(
      ids
        .map((id) => byId.get(id))
        .filter((a): a is { _id: string; url: string; originalFilename?: string } => !!a?.url)
        .map(async (a, i) => ({
          name: a.originalFilename || `${i + 1}`,
          input: await fetch(a.url),
        })),
    )
    if (!files.length) continue

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
