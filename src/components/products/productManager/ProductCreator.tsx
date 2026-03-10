/* eslint-disable max-nested-callbacks */
/* eslint-disable no-nested-ternary */
import { Container, Flex, Heading, Stack, Tab, TabList, TabPanel, Text, useToast } from '@sanity/ui'
import { ComponentType, ReactElement } from 'react'
import { memo, useCallback, useEffect, useState } from 'react'

import {
  ProductKindBundleIcon,
  ProductKindDigitalIcon,
  ProductKindPhysicalIcon,
  ProductKindWineIcon,
} from '../../../assets/icons'
import { useITSContext } from '../../../context/ITSCoreProvider'
import { ProductKind } from '../../../types'
import { docUid, toCents, uid } from '../../../utils/utils'
import {
  BundleVariantRow,
  CombinationRow,
  I18nTitleEntry,
  KindTabProps,
  OptionGroup,
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
  const toast = useToast()

  const { fieldLocales, defaultLocale } = config.localization
  const enabledKinds = config.schemaSettings.productKinds

  const [activeKind, setActiveKind] = useState<ProductKind>(enabledKinds[0])
  const [titles, setTitles] = useState<I18nTitleEntry[]>([])
  const [globalPrice, setGlobalPrice] = useState('')
  const [globalTaxCategoryId, setGlobalTaxCategoryId] = useState('')
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([])
  const [loadingTax, setLoadingTax] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
  const handleGlobalPriceChange = useCallback((val: string) => setGlobalPrice(val), [])
  const handleGlobalTaxChange = useCallback((val: string) => setGlobalTaxCategoryId(val), [])

  // Build i18nString array for Sanity from titles state
  const buildI18nTitle = useCallback(
    (entries: I18nTitleEntry[]) =>
      entries.filter((e) => e.value.trim()).map((e) => ({ _key: e.locale, value: e.value.trim() })),
    [],
  )

  const resetShared = useCallback(() => {
    setTitles([])
    setGlobalPrice('')
    setGlobalTaxCategoryId('')
  }, [])

  // ─── Wine submit ─────────────────────────────────────────────────────────────

  const handleWineSubmit = useCallback(
    async (rows: WineRow[]) => {
      setSubmitting(true)
      try {
        const tx = client.transaction()
        const productId = docUid('product')
        const globalPriceCents = toCents(globalPrice)

        tx.create({
          _id: productId,
          _type: 'product',
          title: buildI18nTitle(titles),
          kind: 'wine',
          ...(globalPriceCents !== undefined && { price: globalPriceCents }),
          ...(globalTaxCategoryId && {
            taxCategory: { _type: 'reference', _ref: globalTaxCategoryId },
          }),
        })

        for (const row of rows) {
          if (!row.wine || !row.volume) continue
          const rowPriceCents = toCents(row.price)
          const effectivePriceCents = rowPriceCents // ?? globalPriceCents
          const effectiveTaxId = row.taxCategoryId // || globalTaxCategoryId
          const rowTitles = buildI18nTitle(row.titles)

          tx.create({
            _id: docUid('productVariant'),
            _type: 'productVariant',
            kind: 'wine',
            product: { _type: 'reference', _ref: productId },
            status: 'active',
            featured: false,
            ...(rowTitles.length && { title: rowTitles }),
            wine: {
              _type: 'wine',
              vinofactWineId: row.wine.id,
              ...(row.wine.year && { vintage: row.wine.year }),
              volume: parseInt(row.volume, 10),
            },
            ...(effectivePriceCents !== undefined && { price: effectivePriceCents }),
            ...(effectiveTaxId && {
              taxCategory: { _type: 'reference', _ref: effectiveTaxId },
            }),
          })
        }

        await tx.commit()

        const title = titles.find((ts) => ts.locale === defaultLocale)?.value ?? ''
        const count = rows.length
        toast.push({
          status: 'success',
          title: componentT.default('productCreatorTool.messages.productCreated.title'),
          description: componentT.default(
            'productCreatorTool.messages.productCreated.description',
            'Product created',
            { title, count },
          ),
        })

        resetShared()
      } catch (err: any) {
        toast.push({
          status: 'error',
          title: componentT.default('productCreatorTool.messages.productCreatedFail.title'),
          description: err.message,
        })
      } finally {
        setSubmitting(false)
      }
    },
    [
      client,
      titles,
      globalPrice,
      globalTaxCategoryId,
      defaultLocale,
      buildI18nTitle,
      resetShared,
      toast,
      componentT,
    ],
  )

  const handlePhysicalDigitalSubmit = useCallback(
    async (combinations: CombinationRow[], activeGroups: OptionGroup[]) => {
      setSubmitting(true)
      try {
        const tx = client.transaction()
        const productId = docUid('product')
        const globalPriceCents = toCents(globalPrice)

        tx.create({
          _id: productId,
          _type: 'product',
          title: buildI18nTitle(titles),
          kind: activeKind, // 'physical' or 'digital'
          ...(globalPriceCents !== undefined && { price: globalPriceCents }),
          ...(globalTaxCategoryId && {
            taxCategory: { _type: 'reference', _ref: globalTaxCategoryId },
          }),
        })

        for (const combo of combinations) {
          if (!combo.enabled) continue
          const rowPriceCents = toCents(combo.price)
          const effectivePriceCents = rowPriceCents // ?? globalPriceCents
          const effectiveTaxId = combo.taxCategoryId // || globalTaxCategoryId
          const rowTitles = buildI18nTitle(combo.titles)

          // Build a readable variant title from option labels
          // const variantTitleStr = combo.optionIds
          //   .map((optId, i) => activeGroups[i]?.options.find((o) => o._id === optId)?.title ?? '')
          //   .filter(Boolean)
          //   .join(' / ')

          tx.create({
            _id: docUid('productVariant'),
            _type: 'productVariant',
            kind: activeKind,
            product: { _type: 'reference', _ref: productId },
            status: 'active',
            featured: false,
            ...(rowTitles.length && { title: rowTitles }),
            options: combo.optionIds.map((optId) => ({
              _key: uid(),
              _type: 'reference',
              _ref: optId,
            })),
            ...(effectivePriceCents !== undefined && { price: effectivePriceCents }),
            ...(effectiveTaxId && {
              taxCategory: { _type: 'reference', _ref: effectiveTaxId },
            }),
          })
        }

        await tx.commit()

        const title = titles.find((t) => t.locale === defaultLocale)?.value ?? ''
        const count = combinations.length
        toast.push({
          status: 'success',
          title: componentT.default('productCreatorTool.messages.productCreated.title'),
          description: componentT.default(
            'productCreatorTool.messages.productCreated.description',
            'Product created',
            { title, count },
          ),
        })

        resetShared()
      } catch (err: any) {
        toast.push({
          status: 'error',
          title: componentT.default('productCreatorTool.messages.productCreatedFail.title'),
          description: err.message,
        })
      } finally {
        setSubmitting(false)
      }
    },
    [
      client,
      titles,
      globalPrice,
      globalTaxCategoryId,
      activeKind,
      defaultLocale,
      buildI18nTitle,
      resetShared,
      toast,
      componentT,
    ],
  )

  const handleBundleSubmit = useCallback(
    async (rows: BundleVariantRow[]) => {
      setSubmitting(true)
      try {
        const tx = client.transaction()
        const productId = docUid('product')
        const globalPriceCents = toCents(globalPrice)

        tx.create({
          _id: productId,
          _type: 'product',
          title: buildI18nTitle(titles),
          kind: 'bundle',
          ...(globalPriceCents !== undefined && { price: globalPriceCents }),
          ...(globalTaxCategoryId && {
            taxCategory: { _type: 'reference', _ref: globalTaxCategoryId },
          }),
        })

        for (const row of rows) {
          const rowPriceCents = toCents(row.price)
          const effectivePriceCents = rowPriceCents // ?? globalPriceCents
          const effectiveTaxId = row.taxCategoryId // || globalTaxCategoryId
          const rowTitles = buildI18nTitle(row.titles)

          tx.create({
            _id: docUid('productVariant'),
            _type: 'productVariant',
            kind: 'bundle',
            product: { _type: 'reference', _ref: productId },
            status: 'active',
            featured: false,
            ...(rowTitles.length && { title: rowTitles }),
            bundleItems: row.items.map((item) => ({
              _type: 'bundleItem',
              _key: uid(),
              quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
              product: { _type: 'reference', _ref: item.variantId },
            })),
            ...(effectivePriceCents !== undefined && { price: effectivePriceCents }),
            ...(effectiveTaxId && {
              taxCategory: { _type: 'reference', _ref: effectiveTaxId },
            }),
          })
        }

        await tx.commit()

        const title = titles.find((t) => t.locale === defaultLocale)?.value ?? ''
        const count = rows.length
        toast.push({
          status: 'success',
          title: componentT.default('productCreatorTool.messages.productCreated.title'),
          description: componentT.default(
            'productCreatorTool.messages.productCreated.description',
            'Product created',
            { title, count },
          ),
        })

        resetShared()
      } catch (err: any) {
        toast.push({
          status: 'error',
          title: componentT.default('productCreatorTool.messages.productCreatedFail.title'),
          description: err.message,
        })
      } finally {
        setSubmitting(false)
      }
    },
    [
      client,
      titles,
      globalPrice,
      globalTaxCategoryId,
      defaultLocale,
      buildI18nTitle,
      resetShared,
      toast,
      componentT,
    ],
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
