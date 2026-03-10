/* eslint-disable max-nested-callbacks */
/* eslint-disable no-nested-ternary */
import { Container, Flex, Heading, Stack, Tab, TabList, TabPanel, Text } from '@sanity/ui'
import { ComponentType, ReactElement } from 'react'
import { memo, useCallback, useEffect, useState } from 'react'

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
import { ProductKind } from '../../../types'
import {
  BundleVariantRow,
  CombinationRow,
  I18nTitleEntry,
  KindTabProps,
  TaxCategory,
  WineRow,
} from './ProductCreator.types'
import { BundleTab } from './tabs/BundleTab'
import { PhysicalDigitalTab } from './tabs/PhysicalDigitalTab'
import { WineTab } from './tabs/WineTab'

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
  const { config, sanityClient, componentT, schemaT } = ctx
  const client = sanityClient

  const { fieldLocales, defaultLocale } = config.localization
  const enabledKinds = config.schemaSettings.productKinds

  const [activeKind, setActiveKind] = useState<ProductKind>(enabledKinds[0])
  const [titles, setTitles] = useState<I18nTitleEntry[]>([])
  const [globalPrice, setGlobalPrice] = useState<number | undefined>(undefined)
  const [globalTaxCategoryId, setGlobalTaxCategoryId] = useState('')
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([])
  const [loadingTax, setLoadingTax] = useState(true)

  // Load tax categories once — shared across all tabs
  useEffect(() => {
    client
      .fetch<{ categories: TaxCategory[]; defaultCategoryId: string | null }>(
        `{
          "categories": *[_type == "taxCategory"]{
            _id,
            "title": coalesce(
              title[_key == $locale][0].value,
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
        setTaxCategories(categories)
        if (defaultCategoryId) {
          setGlobalTaxCategoryId(defaultCategoryId)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTax(false))
  }, [client, defaultLocale])

  const handleTitlesChange = useCallback((ts: I18nTitleEntry[]) => setTitles(ts), [])
  const handleGlobalPriceChange = useCallback((val: number | undefined) => setGlobalPrice(val), [])
  const handleGlobalTaxChange = useCallback((val: string) => setGlobalTaxCategoryId(val), [])

  // Build i18nString array for Sanity from titles state
  const resetShared = useCallback(() => {
    setTitles([])
    setGlobalPrice(undefined)
    setGlobalTaxCategoryId('')
  }, [])

  const { submitting, commitTransaction } = useProductTransaction({
    titles,
  })

  // ─── Wine submit ─────────────────────────────────────────────────────────────

  const handleWineSubmit = useCallback(
    async (rows: WineRow[]) => {
      const tx = client.transaction()
      const productId = addProductToTx({
        tx,
        kind: 'wine',
        titles,
        price: globalPrice,
        taxId: globalTaxCategoryId,
      })
      for (const row of rows) {
        addWineVariantToTx(tx, productId, row)
      }
      await commitTransaction(tx, rows.length, resetShared)
    },
    [client, titles, globalPrice, globalTaxCategoryId, commitTransaction, resetShared],
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
      })
      for (const combo of combinations) {
        addPhysicalDigitalVariantToTx(tx, productId, activeKind as 'physical' | 'digital', combo)
      }
      await commitTransaction(tx, combinations.length, resetShared)
    },
    [client, activeKind, titles, globalPrice, globalTaxCategoryId, commitTransaction, resetShared],
  )

  const handleBundleSubmit = useCallback(
    async (rows: BundleVariantRow[]) => {
      const tx = client.transaction()
      const productId = addProductToTx({
        tx,
        kind: 'bundle',
        titles,
        price: globalPrice,
        taxId: globalTaxCategoryId,
      })
      for (const row of rows) {
        addBundleVariantToTx(tx, productId, row)
      }
      await commitTransaction(tx, rows.length, resetShared)
    },
    [client, titles, globalPrice, globalTaxCategoryId, resetShared, commitTransaction],
  )

  const showTabs = enabledKinds.length > 1
  const globalProps = {
    titles,
    globalPrice,
    globalTaxCategoryId,
    taxCategories,
    loadingTax,
    locales: fieldLocales,
    defaultLocale,
    onTitlesChange: handleTitlesChange,
    onGlobalPriceChange: handleGlobalPriceChange,
    onGlobalTaxChange: handleGlobalTaxChange,
  }

  return (
    <Flex padding={4} direction="column" height="fill" flex={1}>
      <Container width={2}>
        <Stack space={6}>
          {/* Header */}
          <Stack space={2}>
            <Heading size={3}>{componentT.default('productCreatorTool.title')}</Heading>
            <Text size={1} muted>
              {componentT.default('productCreatorTool.subtitle')}
            </Text>
          </Stack>

          {/* Tabs — only shown when multiple kinds are enabled */}
          {showTabs && (
            <TabList space={1}>
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
                    titlePlaceholder: componentT.default(
                      'productCreatorTool.placeholders.productTitle.physicalDigital',
                    ),
                  }}
                  onSubmit={handlePhysicalDigitalSubmit}
                  submitting={submitting}
                />
              )}
              {kind === 'bundle' && (
                <BundleTab
                  global={{
                    ...globalProps,
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
        </Stack>
      </Container>
    </Flex>
  )
}
