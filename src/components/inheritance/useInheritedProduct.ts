import { useEffect, useState } from 'react'
import { map, type Observable, shareReplay } from 'rxjs'
import { type DocumentStore, type SanityClient, useDocumentStore, useFormValue } from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'
import type { InheritedProductValues } from '../../utils/inheritance'

export interface InheritedProduct {
  /** The published product — what the shop builds from. null when it isn't published. */
  published: InheritedProductValues | null
  /** The product's draft; null when there is none. */
  draft: InheritedProductValues | null
  /** `shopSettings.defaultTaxCategory` as `{ _ref, title, code }`, or null. */
  shopDefaultTax: unknown
}

type Row = InheritedProductValues & { _id: string }

// Shapes for `formatInherited`: references come back as `{ _ref, title }` so `isSet` still works.
const PRODUCT_QUERY = `*[_id in [$id, "drafts." + $id]]{
  _id, price, compareAtPrice, weight, title, description, specifications, image,
  "taxCategory": taxCategory->{ "_ref": _id, title, "code": code.current },
  "categories": categories[]->{ "_ref": _id, title },
  "manufacturers": manufacturers[]->{ "_ref": _id, "title": name }
}`

const SHOP_DEFAULT_TAX_QUERY = `*[_type == "shopSettings" && !(_id in path("drafts.**"))][0]
  .defaultTaxCategory->{ "_ref": _id, title, "code": code.current }`

/** Drops the null entries of dereferenced arrays (a reference to a deleted document). */
function clean(row: Row | undefined): InheritedProductValues | null {
  if (!row) return null
  const out: InheritedProductValues = { ...row }
  for (const key of ['categories', 'manufacturers']) {
    if (Array.isArray(out[key])) out[key] = (out[key] as unknown[]).filter(Boolean)
  }
  return out
}

// One listener per product, shared by all fields of every open variant form of that product.
// Fires on changes of the product (and its draft) only — renaming a referenced tax category /
// category / manufacturer shows after reopening the form.
const products = new Map<string, Observable<Omit<InheritedProduct, 'shopDefaultTax'>>>()

function product$(documentStore: DocumentStore, id: string) {
  let obs = products.get(id)
  if (!obs) {
    obs = documentStore.listenQuery(PRODUCT_QUERY, { id }, {}).pipe(
      map((rows: Row[] | null) => ({
        published: clean((rows ?? []).find((r) => r._id === id)),
        draft: clean((rows ?? []).find((r) => r._id === `drafts.${id}`)),
      })),
      shareReplay({ bufferSize: 1, refCount: true }),
    )
    products.set(id, obs)
  }
  return obs
}

// The shop default changes rarely — fetched once per Studio session.
let shopDefaultTax: Promise<unknown> | undefined

function loadShopDefaultTax(client: SanityClient): Promise<unknown> {
  if (!shopDefaultTax) {
    shopDefaultTax = client.fetch(SHOP_DEFAULT_TAX_QUERY).catch(() => {
      shopDefaultTax = undefined
      return null
    })
  }
  return shopDefaultTax
}

/**
 * The product the open variant form belongs to, live. null while loading, without a product
 * reference, or on an error — the field then shows only its static description.
 */
export function useInheritedProduct(): InheritedProduct | null {
  const documentStore = useDocumentStore()
  const { sanityClient } = useITSContext()
  const ref = (useFormValue(['product']) as { _ref?: string } | undefined)?._ref
  const productId = ref?.replace(/^drafts\./, '')
  // Keyed by id, so a stale value of another product is never returned.
  const [state, setState] = useState<{
    id: string
    value: Omit<InheritedProduct, 'shopDefaultTax'> | null
  } | null>(null)
  const [tax, setTax] = useState<unknown>(null)

  useEffect(() => {
    if (!productId) return undefined
    const sub = product$(documentStore, productId).subscribe({
      next: (value) => setState({ id: productId, value }),
      error: () => setState({ id: productId, value: null }),
    })
    return () => sub.unsubscribe()
  }, [documentStore, productId])

  const product = productId && state?.id === productId ? state.value : null

  useEffect(() => {
    let active = true
    loadShopDefaultTax(sanityClient).then((value) => {
      if (active) setTax(value ?? null)
    })
    return () => {
      active = false
    }
  }, [sanityClient])

  return product ? { ...product, shopDefaultTax: tax } : null
}
