/**
 * Duplicate check of the Product Manager (pure parts). The queries read with the raw
 * perspective, so a product may come back twice: published (`x`) and draft (`drafts.x`).
 */

import { normalizeTitle, normalizeWineName } from './wineName'

export type ExistingProductDoc = { _id: string; title: string | null; cmsTitle?: string | null }
export type ExistingProduct = { id: string; title: string; cmsTitle?: string }

export function publishedId(id: string): string {
  return id.replace(/^drafts\./, '')
}

/** One entry per product (by published id); the draft's fields win. */
export function mergeDrafts(docs: ExistingProductDoc[]): ExistingProduct[] {
  const byId = new Map<string, ExistingProduct & { draft: boolean }>()
  for (const doc of docs) {
    const id = publishedId(doc._id)
    const draft = doc._id !== id
    const prev = byId.get(id)
    if (prev && prev.draft && !draft) continue
    byId.set(id, {
      id,
      draft,
      title: doc.title ?? '',
      ...(doc.cmsTitle && { cmsTitle: doc.cmsTitle }),
    })
  }
  return [...byId.values()].map(({ draft: _draft, ...p }) => p)
}

/** Products whose normalized default-locale title equals `title`'s (physical/digital/bundle). */
export function productsWithTitle(products: ExistingProduct[], title: string): ExistingProduct[] {
  const key = normalizeTitle(title)
  if (!key) return []
  return products.filter((p) => normalizeTitle(p.title) === key)
}

/**
 * Wine products that look like the seed wine: the product title or the VinoFact name of any of
 * its variants' wines has the same `normalizeWineName`.
 */
export function wineProductsLike(
  products: ExistingProduct[],
  variants: { productId: string | null; wineId: string | null }[],
  wineNames: Map<string, string>,
  seedTitle: string,
): ExistingProduct[] {
  const key = normalizeWineName(seedTitle)
  if (!key) return []
  const namesByProduct = new Map<string, string[]>()
  for (const v of variants) {
    if (!v.productId || !v.wineId) continue
    const name = wineNames.get(v.wineId)
    if (!name) continue
    const id = publishedId(v.productId)
    namesByProduct.set(id, [...(namesByProduct.get(id) ?? []), name])
  }
  return products.filter(
    (p) =>
      normalizeWineName(p.title) === key ||
      (namesByProduct.get(p.id) ?? []).some((n) => normalizeWineName(n) === key),
  )
}
