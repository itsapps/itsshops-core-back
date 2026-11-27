import { useEffect, useState } from 'react'
import { map, type Observable, shareReplay } from 'rxjs'
import { type DocumentStore, useDocumentStore } from 'sanity'

import type { VariantRowForOverride } from '../../utils/inheritance'
import { VARIANT_ORDER } from '../../utils/variantOrder'
import { collapseDrafts } from '../PreviewCountMedia'

export type OverrideRow = VariantRowForOverride & {
  isDraft: boolean
  title?: unknown
  wineVolume?: number | null
  wineVintage?: string | null
  optionTitles?: unknown[] | null
}

const VARIANTS_QUERY = `*[_type == "productVariant" && product._ref == $id && !(_id in path("versions.**"))]
  | order(${VARIANT_ORDER}){
    _id, kind, title, price, compareAtPrice, weight, description, specifications, image,
    taxCategory, categories, manufacturers,
    "wineVolume": wine.volume, "wineVintage": wine.vintage, "optionTitles": options[]->title
  }`

// One listener per open product, shared by all its fields. Drafts collapsed — the draft wins
// (what the editor sees in the variant form; the link label says "(Entwurf)").
const variants = new Map<string, Observable<OverrideRow[]>>()

function variants$(documentStore: DocumentStore, id: string) {
  let obs = variants.get(id)
  if (!obs) {
    obs = documentStore.listenQuery(VARIANTS_QUERY, { id }, {}).pipe(
      map((rows: VariantRowForOverride[] | null) =>
        collapseDrafts(rows ?? []).map(({ row, isDraft }) => ({ ...row, isDraft })),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    )
    variants.set(id, obs)
  }
  return obs
}

/** The product's variants, live; null while loading, without an id, or on an error. */
export function useOverridingVariants(productId: string | undefined): OverrideRow[] | null {
  const documentStore = useDocumentStore()
  // Keyed by id, so a stale list of another product is never returned.
  const [state, setState] = useState<{ id: string; rows: OverrideRow[] | null } | null>(null)
  useEffect(() => {
    if (!productId) return undefined
    const sub = variants$(documentStore, productId).subscribe({
      next: (rows) => setState({ id: productId, rows }),
      error: () => setState({ id: productId, rows: null }),
    })
    return () => sub.unsubscribe()
  }, [documentStore, productId])
  return productId && state?.id === productId ? state.rows : null
}
