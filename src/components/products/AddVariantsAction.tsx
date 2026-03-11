import { Box, Card, Flex, Spinner, Stack, Text, useToast } from '@sanity/ui'
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
} from './productManager/ProductCreator.types'
import { BundleTab } from './productManager/tabs/BundleTab'
import { PhysicalDigitalTab } from './productManager/tabs/PhysicalDigitalTab'
import { WineTab } from './productManager/tabs/WineTab'

// ─── Types ────────────────────────────────────────────────────────────────────

type ExistingVariant = Pick<ProductVariant, '_id' | 'weight'> & {
  kind: ProductKind
  vinofactWineId: Wine['vinofactWineId']
  volume: Wine['volume']
  optionRefs: VariantOptionReference['_ref'][] | undefined
  // weight: number | undefined
}
type ProductWithKind = Pick<Product, '_id'> & { kind: ProductKind }
// interface ProductDoc {
//   _id: string
//   kind: ProductKind
// }

interface AddVariantsDialogProps {
  productId: string
  onClose: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWineKey(vinofactWineId: string, volume: number): string {
  return `${vinofactWineId}:${volume}`
}

function buildOptionSetKey(optionIds: string[]): string {
  return [...optionIds].sort().join('|')
}

// ─── AddVariantsDialog ────────────────────────────────────────────────────────

export function AddVariantsDialog({ productId, onClose }: AddVariantsDialogProps): ReactElement {
  const { config, sanityClient } = useITSContext()
  const client = sanityClient
  const toast = useToast()

  const { fieldLocales, defaultLocale } = config.localization

  const [product, setProduct] = useState<ProductWithKind | null>(null)
  const [existingVariants, setExistingVariants] = useState<ExistingVariant[]>([])
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([])
  const [loadingTax, setLoadingTax] = useState(true)
  const [loading, setLoading] = useState(true)

  // Fetch product + existing variants + tax categories in one go
  useEffect(() => {
    client
      .fetch<{
        product: ProductWithKind
        variants: ExistingVariant[]
        categories: (Pick<CoreTaxCategory, '_id'> & { title: string | undefined; code: string })[]
      }>(
        `{
          "product": *[_type == "product" && _id == $productId][0]{
            _id, kind,
          },
          "variants": *[_type == "productVariant" && product._ref == $productId]{
            _id, kind,
            "vinofactWineId": wine.vinofactWineId,
            "volume": wine.volume,
            "optionRefs": options[]._ref,
            weight
          },
          "categories": *[_type == "taxCategory"]{
            _id,
            "title": coalesce(
              title[_key == $locale][0].value,
              title[0].value
            ),
            "code": code.current
          }
        }`,
        { locale: defaultLocale, productId },
      )
      .then((data) => {
        const { product: p, categories, variants } = data
        setProduct(p)
        setExistingVariants(variants)
        setTaxCategories(categories.map((t) => ({ ...t, title: t.title || '' })))
      })
      .catch((err) => {
        toast.push({ status: 'error', title: 'Failed to load product', description: err.message })
      })
      .finally(() => {
        setLoading(false)
        setLoadingTax(false)
      })
  }, [client, productId, defaultLocale, toast])

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

  // ─── Submit handlers ────────────────────────────────────────────────────────
  const { submitting, commitTransaction } = useProductTransaction({ titles: [] })

  const handleWineSubmit = useCallback(
    async (rows: WineRow[]) => {
      if (!product) return

      const tx = client.transaction()
      rows.forEach((r) => addWineVariantToTx(tx, productId, r))
      await commitTransaction(tx, rows.length, onClose)
    },
    [client, product, productId, onClose, commitTransaction],
  )

  const handlePhysicalDigitalSubmit = useCallback(
    async (combinations: CombinationRow[]) => {
      if (!product) return

      const tx = client.transaction()
      combinations.forEach((c) =>
        addPhysicalDigitalVariantToTx(tx, productId, product.kind as 'physical' | 'digital', c),
      )
      await commitTransaction(tx, combinations.length, onClose)
    },
    [client, product, productId, onClose, commitTransaction],
  )

  const handleBundleSubmit = useCallback(
    async (rows: BundleVariantRow[]) => {
      if (!product) return
      const tx = client.transaction()
      rows.forEach((r) => addBundleVariantToTx(tx, productId, r))
      await commitTransaction(tx, rows.length, onClose)
    },
    [client, product, productId, onClose, commitTransaction],
  )

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Shared global props — no titles in add-variants mode, no global price
  const globalProps = useMemo(
    () => ({
      kind: product?.kind || 'wine',
      titles: [],
      globalPrice: undefined,
      globalTaxCategoryId: '',
      taxCategories,
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
    [product?.kind, taxCategories, loadingTax, fieldLocales, defaultLocale],
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
          <Text size={1}>Product not found.</Text>
        </Card>
      )
    }

    switch (product.kind) {
      case 'wine':
        return (
          <WineTab
            global={globalProps}
            existingWineKeys={existingWineKeys}
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
            <Text size={1}>Unknown product kind.</Text>
          </Card>
        )
    }
  }

  return (
    <Box padding={1}>
      <Stack space={1}>{renderContent()}</Stack>
    </Box>
  )
}

// ─── AddVariantsAction ────────────────────────────────────────────────────────

export const AddVariantsAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, published } = props
  const { structureT } = useITSContext()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleOpen = () => setDialogOpen(true)
  const handleClose = useCallback(() => setDialogOpen(false), [])

  const title = structureT.default(`products.addVariant`)

  return {
    label: title,
    icon: AddIcon,
    disabled: !published,
    onHandle: handleOpen,
    // onClose: handleClose,
    dialog: dialogOpen
      ? {
          type: 'dialog' as const,
          id: 'add-variants-dialog',
          header: title,
          width: 'medium',
          onClose: handleClose,
          content: <AddVariantsDialog productId={id} onClose={handleClose} />,
        }
      : false,
  }
}
