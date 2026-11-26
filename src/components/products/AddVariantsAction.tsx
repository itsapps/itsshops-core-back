import { Card, Flex, Spinner, Stack, Text } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { DocumentActionComponent, DocumentActionProps } from 'sanity'

import { AddIcon } from '../../assets/icons'
import { useITSContext } from '../../context/ITSCoreProvider'
import { useProductTransaction } from '../../lib/hooks/useProductTransaction'
import {
  addBundleVariantToTx,
  addPhysicalDigitalVariantToTx,
  addWineVariantToTx,
} from '../../lib/shop/productVariant.tx'
import {
  Product,
  ProductKind,
  ProductVariant,
  TaxCategory as CoreTaxCategory,
  VariantOptionReference,
  Wine,
} from '../../types'
import {
  BundleVariantRow,
  CombinationRow,
  TaxCategory,
  WineRow,
  WineSubmitOptions,
} from './productManager/ProductCreator.types'
import { BundleTab } from './productManager/tabs/BundleTab'
import { PhysicalDigitalTab } from './productManager/tabs/PhysicalDigitalTab'
import { WineTab } from './productManager/tabs/WineTab'
import { useBackgroundBottleImport } from './useBottleImageImport'

// ─── Types ────────────────────────────────────────────────────────────────────

type ExistingVariant = Pick<ProductVariant, '_id' | 'weight'> & {
  kind: ProductKind
  vinofactWineId: Wine['vinofactWineId']
  volume: Wine['volume']
  optionRefs: VariantOptionReference['_ref'][] | undefined
  // weight: number | undefined
}
type ProductWithKind = Pick<Product, '_id'> & {
  kind: ProductKind
  /** Default-locale title. */
  title?: string | null
  price?: number
  taxCategoryId?: string
}

interface AddVariantsDialogProps {
  productId: string
  onClose: () => void
  /**
   * `dialog` (document action, closes after submit) or `pane` (desk structure, stays open and
   * reloads the existing variants after each submit).
   */
  variant: 'dialog' | 'pane'
}

type LoadResult = {
  product: ProductWithKind | null
  variants: ExistingVariant[]
  categories: (Pick<CoreTaxCategory, '_id'> & { title: string | undefined; code: string })[]
  shopDefaultTaxCategoryId: string | null
}

// Raw perspective: existing variants include drafts. Both versions of an edited variant count
// (only their keys are used): a draft that changed the volume must not free the published one's
// key. Everything else stays published-only.
const PUBLISHED = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))'
const LOAD_QUERY = `{
  "product": *[_type == "product" && _id == $productId && ${PUBLISHED}][0]{
    _id, kind, price, "taxCategoryId": taxCategory._ref,
    "title": coalesce(title[language == $locale][0].value, title[0].value)
  },
  "variants": *[_type == "productVariant" && product._ref == $productId && !(_id in path("versions.**"))]{
    _id, kind,
    "vinofactWineId": wine.vinofactWineId,
    "volume": wine.volume,
    "optionRefs": options[]._ref,
    weight
  },
  "categories": *[_type == "taxCategory" && ${PUBLISHED}]{
    _id,
    "title": coalesce(
      title[language == $locale][0].value,
      title[0].value
    ),
    "code": code.current
  },
  "shopDefaultTaxCategoryId": *[_type == "shopSettings" && ${PUBLISHED}][0].defaultTaxCategory._ref
}`

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWineKey(vinofactWineId: string, volume: number): string {
  return `${vinofactWineId}:${volume}`
}

function buildOptionSetKey(optionIds: string[]): string {
  return [...optionIds].sort().join('|')
}

// ─── AddVariantsDialog ────────────────────────────────────────────────────────

export function AddVariantsDialog({
  productId,
  onClose,
  variant,
}: AddVariantsDialogProps): ReactElement {
  const { config, sanityClient, componentT, format } = useITSContext()
  const client = sanityClient
  const toast = useToast()

  const { fieldLocales, defaultLocale } = config.localization

  const [product, setProduct] = useState<ProductWithKind | null>(null)
  const [existingVariants, setExistingVariants] = useState<ExistingVariant[]>([])
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([])
  const [shopDefaultTaxCategoryId, setShopDefaultTaxCategoryId] = useState<string | undefined>()
  const [loadingTax, setLoadingTax] = useState(true)
  const [loading, setLoading] = useState(true)

  /**
   * Product + existing variants + tax categories in one go. `initial` (mount) shows the spinner;
   * a reload after a submit doesn't (the spinner would unmount the tab and lose its state), and a
   * failed reload keeps the old data.
   */
  const load = useCallback(
    async (initial: boolean) => {
      try {
        const data = await client.fetch<LoadResult>(
          LOAD_QUERY,
          { locale: defaultLocale, productId },
          { perspective: 'raw' },
        )
        setProduct(data.product)
        setExistingVariants(data.variants)
        setTaxCategories(data.categories.map((t) => ({ ...t, title: t.title || '' })))
        setShopDefaultTaxCategoryId(data.shopDefaultTaxCategoryId ?? undefined)
      } catch (err: any) {
        toast.push({
          status: 'error',
          title: componentT.default('productCreatorTool.errors.loadProduct'),
          description: err.message,
        })
      } finally {
        if (initial) {
          setLoading(false)
          setLoadingTax(false)
        }
      }
    },
    [client, productId, defaultLocale, toast, componentT],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    load(true)
  }, [load])

  // The pane's persistent confirmation (a toast times out, WCAG 2.2.1); cleared on the next submit
  const [lastAdded, setLastAdded] = useState<number | null>(null)

  // The pane stays open: reload so the variants just added count as existing. The dialog closes.
  const afterCommit = useCallback(
    (ok: boolean, count: number) => {
      if (ok && variant === 'pane') {
        setLastAdded(count)
        load(false)
      }
      return ok
    },
    [load, variant],
  )

  // Build existing keys for dedup display
  const existingWineKeys = useMemo(() => {
    return new Set(
      existingVariants
        .filter((v) => v.kind === 'wine' && v.vinofactWineId && v.volume)
        .map((v) => buildWineKey(v.vinofactWineId!, v.volume!)),
    )
  }, [existingVariants])

  const existingOptionSets = useMemo(() => {
    return new Set(
      existingVariants
        .filter((v) => v.optionRefs && v.optionRefs.length > 0)
        .map((v) => buildOptionSetKey(v.optionRefs!)),
    )
  }, [existingVariants])

  // The product's wines seed the wine grid (with their same-name vintages)
  const seedWineIds = useMemo(
    () => [
      ...new Set(
        existingVariants
          .filter((v) => v.kind === 'wine' && v.vinofactWineId)
          .map((v) => v.vinofactWineId!),
      ),
    ],
    [existingVariants],
  )

  // ─── Submit handlers ────────────────────────────────────────────────────────
  const toastTitles = useMemo(
    () => [{ locale: defaultLocale, value: product?.title ?? '' }],
    [defaultLocale, product?.title],
  )
  const { submitting, commitTransaction } = useProductTransaction({
    titles: toastTitles,
    mode: 'add',
  })
  const importBottleImagesInBackground = useBackgroundBottleImport()

  const handleWineSubmit = useCallback(
    async (rows: WineRow[], options: WineSubmitOptions) => {
      if (!product) return false
      setLastAdded(null)

      const tx = client.transaction()
      const targets = rows.flatMap((r) => {
        const variantId = addWineVariantToTx(tx, productId, r)
        return variantId && r.wine ? [{ variantId, wineId: r.wine.id }] : []
      })
      const ok = await commitTransaction(tx, targets.length, onClose)
      // Not awaited: the dialog closes as before, the import's toasts outlive it.
      if (ok && options.importBottleImages) importBottleImagesInBackground(targets)
      return afterCommit(ok, targets.length)
    },
    [
      client,
      product,
      productId,
      onClose,
      commitTransaction,
      importBottleImagesInBackground,
      afterCommit,
    ],
  )

  const handlePhysicalDigitalSubmit = useCallback(
    async (combinations: CombinationRow[]) => {
      if (!product) return false
      setLastAdded(null)

      const tx = client.transaction()
      combinations.forEach((c) =>
        addPhysicalDigitalVariantToTx(tx, productId, product.kind as 'physical' | 'digital', c),
      )
      return afterCommit(
        await commitTransaction(tx, combinations.length, onClose),
        combinations.length,
      )
    },
    [client, product, productId, onClose, commitTransaction, afterCommit],
  )

  const handleBundleSubmit = useCallback(
    async (rows: BundleVariantRow[]) => {
      if (!product) return false
      setLastAdded(null)
      const tx = client.transaction()
      rows.forEach((r) => addBundleVariantToTx(tx, productId, r))
      return afterCommit(await commitTransaction(tx, rows.length, onClose), rows.length)
    },
    [client, product, productId, onClose, commitTransaction, afterCommit],
  )

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Shared global props — no titles in add-variants mode, no global price
  const globalProps = useMemo(
    () => ({
      kind: product?.kind || 'wine',
      titles: [],
      // The product's price: new variants without their own price inherit it (feeds the tabs'
      // price check; the add-variants submit never writes it).
      globalPrice: product?.price,
      // The product's tax category: shown as what new variants inherit (never written here)
      globalTaxCategoryId: product?.taxCategoryId ?? '',
      taxCategories,
      shopDefaultTaxCategoryId,
      loadingTax,
      globalWeight: undefined,
      locales: fieldLocales,
      defaultLocale,
      titlePlaceholder: '',
      onTitlesChange: () => {},
      onGlobalPriceChange: () => {},
      onGlobalTaxChange: () => {},
      onGlobalWeightChange: () => {},
    }),
    // `product`, not `product?.kind`: a reload's new price must reach the tabs
    [product, taxCategories, shopDefaultTaxCategoryId, loadingTax, fieldLocales, defaultLocale],
  )

  const renderContent = () => {
    if (loading) {
      return (
        <Flex align="center" justify="center" padding={6}>
          <Spinner />
        </Flex>
      )
    }

    if (!product) {
      return (
        <Card padding={4} tone="critical">
          <Text size={1}>{componentT.default('productCreatorTool.errors.productNotFound')}</Text>
        </Card>
      )
    }

    switch (product.kind) {
      case 'wine':
        return (
          <WineTab
            global={globalProps}
            existingWineKeys={existingWineKeys}
            seedWineIds={seedWineIds}
            hideProductSection
            onSubmit={handleWineSubmit}
            submitting={submitting}
          />
        )
      case 'physical':
      case 'digital':
        return (
          <PhysicalDigitalTab
            global={globalProps}
            existingOptionSets={existingOptionSets}
            hideProductSection
            onSubmit={handlePhysicalDigitalSubmit}
            submitting={submitting}
            activeKind={product.kind}
          />
        )
      case 'bundle':
        return (
          <BundleTab
            global={globalProps}
            hideProductSection
            onSubmit={handleBundleSubmit}
            submitting={submitting}
          />
        )
      default:
        return (
          <Card padding={4} tone="caution">
            <Text size={1}>{componentT.default('productCreatorTool.errors.unknownKind')}</Text>
          </Card>
        )
    }
  }

  const taxTitle = (id: string | undefined) => {
    const tc = id ? taxCategories.find((t) => t._id === id) : undefined
    return tc ? `${tc.title} (${tc.code})` : undefined
  }
  const productTax = taxTitle(product?.taxCategoryId)
  const shopTax = taxTitle(shopDefaultTaxCategoryId)
  let taxLine = componentT.default('productCreatorTool.addVariants.noTax')
  if (productTax) {
    taxLine = componentT.default('productCreatorTool.addVariants.productTax', undefined, {
      title: productTax,
    })
  } else if (shopTax) {
    taxLine = componentT.default('productCreatorTool.addVariants.shopDefaultTax', undefined, {
      title: shopTax,
    })
  }

  return (
    <Stack gap={4}>
      {/* What the new variants are added to, and what they inherit */}
      {!loading && product && (
        <Card padding={3} radius={2} border>
          <Stack gap={2}>
            <Text size={1} weight="semibold">
              {product.title || product._id}
            </Text>
            <Text size={1} muted>
              {product.price
                ? componentT.default('productCreatorTool.addVariants.productPrice', undefined, {
                    price: format.currency(product.price / 100),
                  })
                : componentT.default('productCreatorTool.addVariants.noProductPrice')}
            </Text>
            {product.kind !== 'bundle' && (
              <Text size={1} muted>
                {taxLine}
              </Text>
            )}
          </Stack>
        </Card>
      )}
      {variant === 'pane' && lastAdded !== null && (
        <Card padding={3} radius={2} tone="positive" border>
          <Text size={1}>
            {componentT.default('productCreatorTool.addVariants.added', undefined, {
              count: lastAdded,
            })}
          </Text>
        </Card>
      )}
      {renderContent()}
    </Stack>
  )
}

// ─── AddVariantsAction ────────────────────────────────────────────────────────

export const AddVariantsAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, published } = props
  const { structureT, componentT } = useITSContext()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleOpen = () => setDialogOpen(true)
  const handleClose = useCallback(() => setDialogOpen(false), [])

  const title = structureT.default(`products.addVariant`)

  return {
    label: title,
    icon: AddIcon,
    disabled: !published,
    // Tooltip: why the action is disabled
    title: published
      ? undefined
      : componentT.default('productCreatorTool.addVariants.publishFirst'),
    onHandle: handleOpen,
    // onClose: handleClose,
    dialog: dialogOpen
      ? {
          type: 'dialog' as const,
          id: 'add-variants-dialog',
          header: title,
          width: 'medium',
          onClose: handleClose,
          content: <AddVariantsDialog productId={id} onClose={handleClose} variant="dialog" />,
        }
      : false,
  }
}
