/* eslint-disable max-nested-callbacks */
/* eslint-disable no-nested-ternary */
import { Card, Container, Flex, Heading, Stack, Tab, TabList, TabPanel, Text } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { ComponentType, ReactElement } from 'react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { IntentLink } from 'sanity/router'

import {
  ProductKindBundleIcon,
  ProductKindDigitalIcon,
  ProductKindPhysicalIcon,
  ProductKindWineIcon,
} from '../../../assets/icons'
import { useITSContext } from '../../../context/ITSCoreProvider'
import { useProductTransaction } from '../../../lib/hooks/useProductTransaction'
import {
  addBundleVariantToTx,
  addPhysicalDigitalVariantToTx,
  addProductToTx,
  addWineVariantToTx,
} from '../../../lib/shop/productVariant.tx'
import { ProductKind, TaxCategory as CoreTaxCategory } from '../../../types'
import { categoryTree } from '../../../utils/productManager'
import { compareLabels } from '../../../utils/variantLabel'
import {
  BundleVariantRow,
  ChoiceOption,
  CombinationRow,
  I18nTitleEntry,
  KindTabProps,
  TaxCategory,
  WineRow,
  WineSubmitOptions,
} from './ProductCreator.types'
import { BundleTab } from './tabs/BundleTab'
import { PhysicalDigitalTab } from './tabs/PhysicalDigitalTab'
import { WineTab } from './tabs/WineTab'
import { useBackgroundBottleImport } from '../useBottleImageImport'

// ─── Tab config ───────────────────────────────────────────────────────────────

const KIND_CONFIG: Record<ProductKind, { icon: ComponentType }> = {
  wine: { icon: ProductKindWineIcon },
  physical: { icon: ProductKindPhysicalIcon },
  digital: { icon: ProductKindDigitalIcon },
  bundle: { icon: ProductKindBundleIcon },
}

const KindTab = memo(function KindTab(props: KindTabProps) {
  const { kind, activeKind, label, icon, onSelect } = props
  const handleClick = useCallback(() => onSelect(kind), [kind, onSelect])

  return (
    <Tab
      id={`tab-${kind}`}
      aria-controls={`panel-${kind}`}
      label={label}
      icon={icon}
      selected={activeKind === kind}
      onClick={handleClick}
    />
  )
})

// ─── CreateProductTool ────────────────────────────────────────────────────────

export function ProductCreator(): ReactElement {
  const ctx = useITSContext()
  const toast = useToast()
  const { config, sanityClient, componentT, schemaT, featureRegistry, localizer } = ctx
  const categoriesOn = featureRegistry.isDocEnabled('category')
  const manufacturersOn = featureRegistry.isDocEnabled('manufacturer')
  const subcategories = featureRegistry.isFeatureEnabled('shop.category.subcategories')
  const client = sanityClient

  const { fieldLocales, defaultLocale } = config.localization
  const enabledKinds = config.schemaSettings.productKinds

  const [activeKind, setActiveKind] = useState<ProductKind>(enabledKinds[0])
  const [titles, setTitles] = useState<I18nTitleEntry[]>([])
  const [globalPrice, setGlobalPrice] = useState<number | undefined>(undefined)
  const [globalTaxCategoryId, setGlobalTaxCategoryId] = useState('')
  const [globalWeight, setGlobalWeight] = useState<number | undefined>(undefined)
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([])
  // Only a hint: an empty product tax category inherits it (and follows a later change of it)
  const [shopDefaultTaxCategoryId, setShopDefaultTaxCategoryId] = useState<string | undefined>()
  const [loadingTax, setLoadingTax] = useState(true)
  // Product level only (decisions 1 + 2); published documents only — a published product must
  // not reference a draft-only one
  const [categoryOptions, setCategoryOptions] = useState<ChoiceOption[]>([])
  const [manufacturerOptions, setManufacturerOptions] = useState<ChoiceOption[]>([])
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [manufacturerIds, setManufacturerIds] = useState<string[]>([])

  useEffect(() => {
    if (!categoriesOn && !manufacturersOn) return
    client
      .fetch<{
        categories: { _id: string; title: unknown; parentId: string | null }[]
        manufacturers: { _id: string; name: unknown }[]
      }>(
        `{
          "categories": ${categoriesOn ? '*[_type == "category"] | order(sortOrder asc){_id, title, "parentId": parent._ref}' : '[]'},
          "manufacturers": ${manufacturersOn ? '*[_type == "manufacturer"]{_id, name}' : '[]'}
        }`,
      )
      .then((data) => {
        setCategoryOptions(
          categoryTree(
            data.categories.map((c) => ({
              _id: c._id,
              title: localizer.value(c.title as never) || c._id,
              parentId: c.parentId,
            })),
            subcategories,
          ),
        )
        setManufacturerOptions(
          data.manufacturers
            .map((m) => ({ _id: m._id, title: localizer.value(m.name as never) || m._id }))
            .sort((a, b) => compareLabels(a.title, b.title)),
        )
      })
      .catch((err) => {
        toast.push({
          status: 'error',
          title: componentT.default('productCreatorTool.errors.loadData'),
          description: err.message,
        })
      })
  }, [client, categoriesOn, manufacturersOn, subcategories, localizer, toast, componentT])

  // Load tax categories once — shared across all tabs
  useEffect(() => {
    client
      .fetch<{
        categories: (Pick<CoreTaxCategory, '_id'> & { title: string | undefined; code: string })[]
        defaultCategoryId: string | null
      }>(
        `{
          "categories": *[_type == "taxCategory"]{
            _id,
            "title": coalesce(
              title[language == $locale][0].value,
              title[0].value
            ),
            "code": code.current
          },
          "defaultCategoryId": *[_type == "shopSettings"][0].defaultTaxCategory._ref
        }`,
        { locale: defaultLocale },
      )
      .then((data) => {
        const { categories, defaultCategoryId } = data
        setTaxCategories(categories.map((t) => ({ ...t, title: t.title || '' })))
        setShopDefaultTaxCategoryId(defaultCategoryId ?? undefined)
      })
      .catch((err) => {
        toast.push({
          status: 'error',
          title: componentT.default('productCreatorTool.errors.loadData'),
          description: err.message,
        })
      })
      .finally(() => setLoadingTax(false))
  }, [client, defaultLocale, toast, componentT])

  const handleTitlesChange = useCallback((ts: I18nTitleEntry[]) => setTitles(ts), [])
  const handleGlobalPriceChange = useCallback((val: number | undefined) => setGlobalPrice(val), [])
  const handleGlobalTaxChange = useCallback((val: string) => setGlobalTaxCategoryId(val), [])
  const handleGlobalWeightChange = useCallback((val: number | undefined) => {
    setGlobalWeight(val)
  }, [])

  // Build i18nString array for Sanity from titles state
  const resetShared = useCallback(() => {
    setTitles([])
    setGlobalPrice(undefined)
    setGlobalTaxCategoryId('')
    setCategoryIds([])
    setManufacturerIds([])
  }, [])

  const { submitting, commitTransaction } = useProductTransaction({
    titles,
  })
  const importBottleImagesInBackground = useBackgroundBottleImport()

  // The last created product, linked under the header — the toast's button times out
  // (WCAG 2.2.1), this one stays until the next submit.
  const [lastCreated, setLastCreated] = useState<{ id: string; title: string } | null>(null)

  /** Commit, then remember the product for the persistent link. */
  const commitProduct = useCallback(
    async (tx: Parameters<typeof commitTransaction>[0], count: number, productId: string) => {
      const title = titles.find((t) => t.locale === defaultLocale)?.value ?? ''
      setLastCreated(null)
      const ok = await commitTransaction(tx, count, resetShared, {
        documentId: productId,
        documentType: 'product',
      })
      if (ok) setLastCreated({ id: productId, title })
      return ok
    },
    [titles, defaultLocale, commitTransaction, resetShared],
  )

  // ─── Wine submit ─────────────────────────────────────────────────────────────

  const handleWineSubmit = useCallback(
    async (rows: WineRow[], options: WineSubmitOptions) => {
      const tx = client.transaction()
      const productId = addProductToTx({
        tx,
        kind: 'wine',
        titles,
        price: globalPrice,
        taxId: globalTaxCategoryId,
        weight: globalWeight,
        categoryIds,
        manufacturerIds,
      })
      const targets = rows.flatMap((row) => {
        const variantId = addWineVariantToTx(tx, productId, row)
        return variantId && row.wine ? [{ variantId, wineId: row.wine.id }] : []
      })
      const ok = await commitProduct(tx, targets.length, productId)
      // Not awaited: the form resets as before; the import reports in its own toasts.
      if (ok && options.importBottleImages) importBottleImagesInBackground(targets)
      return ok
    },
    [
      client,
      titles,
      globalPrice,
      globalTaxCategoryId,
      globalWeight,
      categoryIds,
      manufacturerIds,
      commitProduct,
      importBottleImagesInBackground,
    ],
  )

  const handlePhysicalDigitalSubmit = useCallback(
    async (combinations: CombinationRow[]) => {
      const tx = client.transaction()
      const productId = addProductToTx({
        tx,
        kind: activeKind,
        titles,
        price: globalPrice,
        taxId: globalTaxCategoryId,
        weight: globalWeight,
        categoryIds,
        manufacturerIds,
      })
      for (const combo of combinations) {
        addPhysicalDigitalVariantToTx(tx, productId, activeKind as 'physical' | 'digital', combo)
      }
      return commitProduct(tx, combinations.length, productId)
    },
    [
      client,
      activeKind,
      titles,
      globalPrice,
      globalTaxCategoryId,
      globalWeight,
      categoryIds,
      manufacturerIds,
      commitProduct,
    ],
  )

  const handleBundleSubmit = useCallback(
    async (rows: BundleVariantRow[]) => {
      const tx = client.transaction()
      const productId = addProductToTx({
        tx,
        kind: 'bundle',
        titles,
        price: globalPrice,
        // no tax category: a bundle is taxed by its items
        weight: globalWeight,
        categoryIds,
        manufacturerIds,
      })
      for (const row of rows) {
        addBundleVariantToTx(tx, productId, row)
      }
      return commitProduct(tx, rows.length, productId)
    },
    [client, titles, globalPrice, globalWeight, categoryIds, manufacturerIds, commitProduct],
  )

  const categoryChoices = useMemo(
    () =>
      categoriesOn
        ? { options: categoryOptions, selected: categoryIds, onChange: setCategoryIds }
        : undefined,
    [categoriesOn, categoryOptions, categoryIds],
  )
  const manufacturerChoices = useMemo(
    () =>
      manufacturersOn
        ? { options: manufacturerOptions, selected: manufacturerIds, onChange: setManufacturerIds }
        : undefined,
    [manufacturersOn, manufacturerOptions, manufacturerIds],
  )

  const showTabs = enabledKinds.length > 1
  const globalProps = {
    titles,
    globalPrice,
    globalTaxCategoryId,
    taxCategories,
    shopDefaultTaxCategoryId,
    globalWeight,
    loadingTax,
    locales: fieldLocales,
    defaultLocale,
    onTitlesChange: handleTitlesChange,
    onGlobalPriceChange: handleGlobalPriceChange,
    onGlobalTaxChange: handleGlobalTaxChange,
    onGlobalWeightChange: handleGlobalWeightChange,
    categoryChoices,
    manufacturerChoices,
  }

  return (
    <Flex padding={4} direction="column" height="fill" flex={1}>
      <Container width={2}>
        {/* Room below the last element (the "Zuletzt angelegt" card), not flush with the edge */}
        <Stack gap={6} paddingBottom={6}>
          {/* Header */}
          <Stack gap={2}>
            <Heading as="h1" size={3}>
              {componentT.default('productCreatorTool.title')}
            </Heading>
            <Text size={1} muted>
              {componentT.default('productCreatorTool.subtitle')}
            </Text>
          </Stack>

          {/* Tabs — only shown when multiple kinds are enabled */}
          {showTabs && (
            <TabList gap={1}>
              {enabledKinds.map((kind) => {
                const { icon: Icon } = KIND_CONFIG[kind]
                return (
                  <KindTab
                    key={kind}
                    kind={kind}
                    activeKind={activeKind}
                    label={schemaT.default(`fields.kind.options.${kind}`)}
                    icon={Icon}
                    onSelect={setActiveKind}
                  />
                )
              })}
            </TabList>
          )}

          {/* Tab panels */}
          {enabledKinds.map((kind) => (
            <TabPanel
              key={kind}
              id={`panel-${kind}`}
              aria-labelledby={`tab-${kind}`}
              hidden={activeKind !== kind}
            >
              {kind === 'wine' && (
                <WineTab
                  global={{
                    ...globalProps,
                    kind,
                    titlePlaceholder: componentT.default(
                      'productCreatorTool.placeholders.productTitle.wine',
                    ),
                  }}
                  onSubmit={handleWineSubmit}
                  submitting={submitting}
                />
              )}
              {(kind === 'physical' || kind === 'digital') && (
                <PhysicalDigitalTab
                  global={{
                    ...globalProps,
                    kind,
                    titlePlaceholder: componentT.default(
                      'productCreatorTool.placeholders.productTitle.physicalDigital',
                    ),
                  }}
                  activeKind={kind}
                  onSubmit={handlePhysicalDigitalSubmit}
                  submitting={submitting}
                />
              )}
              {kind === 'bundle' && (
                <BundleTab
                  global={{
                    ...globalProps,
                    kind,
                    titlePlaceholder: componentT.default(
                      'productCreatorTool.placeholders.productTitle.bundle',
                    ),
                  }}
                  onSubmit={handleBundleSubmit}
                  submitting={submitting}
                />
              )}
            </TabPanel>
          ))}

          {/* Right under the submit button, where the editor is when the product is created (the
              form empties, so this is where they look); stays until the next submit — the
              toast times out (WCAG 2.2.1) */}
          {lastCreated && (
            <Card padding={3} radius={2} tone="positive" border>
              <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                <Text size={1}>
                  {componentT.default('productCreatorTool.lastCreated', undefined, {
                    title: lastCreated.title,
                  })}
                </Text>
                <Text size={1} weight="semibold">
                  <IntentLink intent="edit" params={{ id: lastCreated.id, type: 'product' }}>
                    {componentT.default('productCreatorTool.messages.productCreated.open')}
                  </IntentLink>
                </Text>
              </Flex>
            </Card>
          )}
        </Stack>
      </Container>
    </Flex>
  )
}
