import { Card, Stack, Text } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { ReactElement, ReactNode, useEffect, useState } from 'react'
import { IntentLink } from 'sanity/router'

import { useITSContext } from '../../../context/ITSCoreProvider'
import { ProductKind } from '../../../types'
import {
  ExistingProduct,
  ExistingProductDoc,
  mergeDrafts,
  productsWithTitle,
} from '../../../utils/existingProducts'

export const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const

// Raw perspective (the tool's client reads published only by default): an editor-made product
// may exist only as a draft. `versions.**` (releases) never count.
const NOT_VERSION = '!(_id in path("versions.**"))'
const TITLE = '"title": coalesce(title[language == $locale][0].value, title[0].value)'

export type WineVariantRef = { productId: string | null; wineId: string | null }

/**
 * The products of `kind` (drafts merged, default-locale titles), for the duplicate check. With
 * `withWineVariants` also every wine variant's product + VinoFact id (joined client-side by the
 * published id: a draft product is `drafts.x`, variants reference `x`). Loaded once.
 */
export function useExistingProducts(
  kind: ProductKind,
  enabled: boolean,
  withWineVariants = false,
): { products: ExistingProduct[]; variants: WineVariantRef[] } {
  const { sanityClient, config, componentT } = useITSContext()
  const toast = useToast()
  const locale = config.localization.defaultLocale
  const [data, setData] = useState<{ products: ExistingProduct[]; variants: WineVariantRef[] }>({
    products: [],
    variants: [],
  })

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    const variants = withWineVariants
      ? `*[_type == "productVariant" && kind == "wine" && ${NOT_VERSION}]{"productId": product._ref, "wineId": wine.vinofactWineId}`
      : '[]'
    sanityClient
      .fetch<{ products: ExistingProductDoc[]; variants: WineVariantRef[] }>(
        `{
          "products": *[_type == "product" && kind == $kind && ${NOT_VERSION}]{_id, ${TITLE}, cmsTitle},
          "variants": ${variants}
        }`,
        { kind, locale },
        { perspective: 'raw' },
      )
      .then((res) => {
        if (!cancelled) setData({ products: mergeDrafts(res.products), variants: res.variants })
      })
      .catch((err) => {
        toast.push({
          status: 'error',
          title: componentT.default('productCreatorTool.errors.loadExisting'),
          description: err.message,
        })
      })
    return () => {
      cancelled = true
    }
  }, [sanityClient, kind, locale, enabled, withWineVariants, toast, componentT])

  return data
}

export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

export interface DuplicateLine {
  key: string
  /** Text before the product link ("Ried Steinberg 2023 ist schon in"). */
  before: string
  product: ExistingProduct
  /** Text after the link (e.g. "— Jahrgänge dort hinzufügen?"). */
  after?: string
}

/**
 * Caution card listing products that may already exist, each linked. Not a submit reason
 * (two products with the same name can be intended). Announced once, politely, when a hit first
 * appears — not on every change (the live region stays mounted and empty otherwise).
 */
export function DuplicateNotice({ lines }: { lines: DuplicateLine[] }): ReactElement {
  const { componentT } = useITSContext()
  const hasHits = lines.length > 0
  // Adjusted while rendering (not in an effect): set once when hits appear, cleared when gone
  const [prevHasHits, setPrevHasHits] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  if (hasHits !== prevHasHits) {
    setPrevHasHits(hasHits)
    setAnnouncement(hasHits ? componentT.default('productCreatorTool.duplicates.announce') : '')
  }

  let content: ReactNode = null
  if (hasHits) {
    content = (
      <Card tone="caution" padding={3} radius={2} border>
        <Stack gap={3}>
          <Text size={1} weight="semibold">
            {componentT.default('productCreatorTool.duplicates.title')}
          </Text>
          <Stack as="ul" gap={2} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {lines.map((line) => (
              <Text as="li" key={line.key} size={1}>
                {line.before}{' '}
                <IntentLink intent="edit" params={{ id: line.product.id, type: 'product' }}>
                  {line.product.title || line.product.id}
                  {line.product.cmsTitle ? ` (${line.product.cmsTitle})` : ''}
                </IntentLink>
                {line.after ? ` ${line.after}` : ''}
              </Text>
            ))}
          </Stack>
          <Text size={1} muted>
            {componentT.default('productCreatorTool.duplicates.createAnyway')}
          </Text>
        </Stack>
      </Card>
    )
  }

  return (
    <>
      <span role="status" style={srOnly}>
        {announcement}
      </span>
      {content}
    </>
  )
}

/** Duplicate check by title for the physical/digital/bundle tabs (only when creating). */
export function useTitleDuplicates(
  kind: ProductKind,
  title: string,
  enabled: boolean,
): DuplicateLine[] {
  const { componentT } = useITSContext()
  const { products } = useExistingProducts(kind, enabled)
  const debounced = useDebouncedValue(title, 300)
  if (!enabled) return []
  return productsWithTitle(products, debounced).map((product) => ({
    key: product.id,
    before: componentT.default('productCreatorTool.duplicates.sameName'),
    product,
  }))
}
