import type { SanityClient } from 'sanity'

import { vinofactLocaleKey } from '../../external/vinofact'
import type { InternationalizedArrayString, LocaleAltImage } from '../../types/sanity.types'
import type { ITSVinofactClient, VinofactBottleImage } from '../../types/vinofact'
import { buildI18nTitle } from './productVariant.tx'

/**
 * Import of VinoFact bottle images into a variant's own `image` (core-front plan
 * `vinofact-bottle-image-import.md`). One-off copy: afterwards it is an ordinary Sanity image.
 */

/** Size used when VinoFact doesn't know the image's dimensions (imgproxy fits, never enlarges). */
export const BOTTLE_IMAGE_FALLBACK_SIZE = 3000

/** The full-resolution URL: the template's `{{width}}`/`{{height}}` filled with the intrinsic size. */
export function bottleImageUrl(img: VinofactBottleImage): string {
  const width = img.width || BOTTLE_IMAGE_FALLBACK_SIZE
  const height = img.height || BOTTLE_IMAGE_FALLBACK_SIZE
  return img.url.replaceAll('{{width}}', String(width)).replaceAll('{{height}}', String(height))
}

/**
 * Download the image. A plain `fetch(url)` on purpose — no custom headers, no credentials — so the
 * browser sends a simple CORS request (VinoFact's `/r/` sends `Access-Control-Allow-Origin: *`).
 */
export async function fetchBottleImage(
  img: VinofactBottleImage,
  fetchImpl: typeof fetch = fetch,
): Promise<Blob> {
  const response = await fetchImpl(bottleImageUrl(img))
  if (!response.ok) throw new Error(`VinoFact image responded with status ${response.status}`)
  const type = response.headers.get('content-type') ?? ''
  if (!type.startsWith('image/')) throw new Error(`VinoFact image has content type "${type}"`)
  return response.blob()
}

function extensionFor(type: string): string {
  const sub = type.split(';')[0].split('/')[1] ?? 'jpg'
  return sub === 'jpeg' ? 'jpg' : sub.replace(/\+.*$/, '')
}

/** Upload to the dataset's assets (Sanity dedupes identical files by SHA-1). Returns the asset id. */
export async function uploadBottleImage(
  client: SanityClient,
  blob: Blob,
  { wineId, url }: { wineId: string; url: string },
): Promise<string> {
  const asset = await client.assets.upload('image', blob, {
    filename: `vinofact-${wineId}.${extensionFor(blob.type)}`,
    source: { name: 'vinofact', id: wineId, url },
  })
  return asset._id
}

/**
 * The new `image` value. Alt per content locale (in `locales` order): an existing non-blank alt is
 * kept as is (same `_key`) — an editor's text wins; otherwise VinoFact's alt fills it. Entries for
 * languages that aren't content locales are dropped; no alt at all → no `alt` field. Crop and
 * hotspot are not carried over (they belong to the old image).
 */
export function buildLocaleAltImage(
  assetId: string,
  alt: VinofactBottleImage['alt'],
  locales: string[],
  existingAlt?: InternationalizedArrayString | null,
): LocaleAltImage {
  const entries: InternationalizedArrayString = []
  for (const locale of locales) {
    const kept = existingAlt?.find((e) => e.language === locale && e.value?.trim())
    if (kept) {
      entries.push(kept)
      continue
    }
    const value = alt?.[vinofactLocaleKey(locale)] ?? ''
    entries.push(...(buildI18nTitle([{ locale, value }]) as InternationalizedArrayString))
  }
  return {
    _type: 'localeAltImage',
    asset: { _type: 'reference', _ref: assetId },
    ...(entries.length && { alt: entries }),
  }
}

export type BottleImageTarget = {
  /** The exact document to patch — draft or published, chosen by the caller. */
  variantId: string
  wineId: string
  existingAlt?: InternationalizedArrayString | null
}

/** A wine variant row read with the raw perspective (drafts and published side by side). */
export type BottleImageVariantRow = {
  _id: string
  wineId?: string | null
  hasImage: boolean
  existingAlt?: InternationalizedArrayString | null
}

/**
 * Targets of the product action: per variant its draft row if there is one, else the published
 * one (a patch to published under a draft would be lost on publish); only rows with a VinoFact id
 * and without an image asset.
 */
export function bottleImageTargets(rows: BottleImageVariantRow[]): BottleImageTarget[] {
  const byPublishedId = new Map<string, BottleImageVariantRow>()
  for (const row of rows) {
    const publishedId = row._id.replace(/^drafts\./, '')
    if (row._id.startsWith('drafts.') || !byPublishedId.has(publishedId))
      byPublishedId.set(publishedId, row)
  }
  return [...byPublishedId.values()]
    .filter((row) => row.wineId && !row.hasImage)
    .map((row) => ({ variantId: row._id, wineId: row.wineId!, existingAlt: row.existingAlt }))
}

export type BottleImageImportResult = { imported: number; noImage: number; failed: number }

/**
 * Import the bottle images of several variants: one VinoFact request for all wines, then one
 * variant after another (full-resolution files can be several MB). A per-variant failure is
 * counted and logged; only a failing VinoFact request throws.
 */
export async function importBottleImages(
  deps: {
    client: SanityClient
    vinofactClient: ITSVinofactClient
    locales: string[]
    fetchImpl?: typeof fetch
  },
  targets: BottleImageTarget[],
): Promise<BottleImageImportResult> {
  const result: BottleImageImportResult = { imported: 0, noImage: 0, failed: 0 }
  if (!targets.length) return result

  const ids = [...new Set(targets.map((t) => t.wineId))]
  const { wines } = await deps.vinofactClient.getBottleImages(ids, deps.locales)
  const byId = new Map(wines.map((w) => [String(w.id), w.bottleImage]))

  for (const target of targets) {
    const img = byId.get(String(target.wineId))
    if (!img) {
      result.noImage++
      continue
    }
    try {
      const url = bottleImageUrl(img)
      const blob = await fetchBottleImage(img, deps.fetchImpl)
      const assetId = await uploadBottleImage(deps.client, blob, { wineId: target.wineId, url })
      const image = buildLocaleAltImage(assetId, img.alt, deps.locales, target.existingAlt)
      await deps.client.patch(target.variantId).set({ image }).commit()
      result.imported++
    } catch (err) {
      console.error(`[itsshops] VinoFact bottle image import failed for ${target.variantId}:`, err)
      result.failed++
    }
  }
  return result
}
