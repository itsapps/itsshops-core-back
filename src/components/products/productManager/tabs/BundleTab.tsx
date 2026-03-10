/* eslint-disable max-nested-callbacks */
/* eslint-disable no-nested-ternary */
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Label,
  Stack,
  Text,
  TextInput,
  useToast,
} from '@sanity/ui'
import { ChangeEvent, ReactElement } from 'react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { AddIcon, CloseIcon } from '../../../../assets/icons'
import { useITSContext } from '../../../../context/ITSCoreProvider'
import { uid } from '../../../../utils/utils'
import { I18nTitleInputs } from '../fields/I18nTitleField'
import { PriceField } from '../fields/PriceField'
import { TaxCategoryField } from '../fields/TaxCategoryField'
import { VariantRow } from '../fields/VariantRow'
import { VariantSectionHeader } from '../fields/VariantSectionHeader'
import {
  BundleTabProps,
  BundleVariantResult,
  BundleVariantRow,
  BundleVariantRowItemProps,
  BundleVariantRowProps,
  I18nTitleEntry,
} from '../ProductCreator.types'
import { ProductTab } from './ProductTab'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyBundleRow(): BundleVariantRow {
  return { id: uid(), items: [], price: undefined, taxCategoryId: '', titles: [] }
}

export const BundleVariantRowItem = memo(function BundleVariantRowItem({
  item,
  rowId,
  onRemove,
  onQuantityChange,
}: BundleVariantRowItemProps) {
  const { schemaT } = useITSContext()
  const handleRemove = useCallback(
    () => onRemove(rowId, item.variantId),
    [onRemove, rowId, item.variantId],
  )

  const handleQuantityChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      onQuantityChange(rowId, item.variantId, e.currentTarget.value),
    [onQuantityChange, rowId, item.variantId],
  )

  return (
    <Card border radius={2} padding={2}>
      <Flex align="center" gap={3}>
        <Box flex={1}>
          <Text size={1}>{item.variantLabel}</Text>
        </Box>
        <Flex align="center" gap={2} style={{ flexShrink: 0 }}>
          <Label size={0}>{schemaT.default('bundleItem.fields.quantity.title')}</Label>
          <Box style={{ width: 64 }}>
            <TextInput type="number" value={item.quantity} onChange={handleQuantityChange} />
          </Box>
          <Button
            mode="bleed"
            tone="critical"
            icon={CloseIcon}
            padding={1}
            onClick={handleRemove}
          />
        </Flex>
      </Flex>
    </Card>
  )
})

export const BundleVariantRowCard = memo(function BundleVariantRowCard(
  props: BundleVariantRowProps,
) {
  const {
    row,
    index,
    canRemove,
    allVariantOptions,
    loadingVariants,
    taxCategories,
    loadingTax,
    locales,
    defaultLocale,
    titlePlaceholder,
    getVariantLabel,
    onRemoveRow,
    onAddItem,
    onRemoveItem,
    onQuantityChange,
    onUpdateRow,
  } = props
  const { studioT, structureT, schemaT } = useITSContext()
  const [query, setQuery] = useState('')

  const handleRemoveRow = useCallback(() => onRemoveRow(row.id), [onRemoveRow, row.id])

  const handleAddItem = useCallback(
    (variantId: string) => {
      onAddItem(row.id, variantId)
      setQuery('')
    },
    [onAddItem, row.id],
  )

  const handleQueryChange = useCallback((q: string | null) => setQuery(q ?? ''), [])

  const handlePriceChange = useCallback(
    (value: number | undefined) => onUpdateRow(row.id, 'price', value),
    [onUpdateRow, row.id],
  )

  const handleTaxChange = useCallback(
    (value: string) => onUpdateRow(row.id, 'taxCategoryId', value),
    [onUpdateRow, row.id],
  )

  const handleTitlesChange = useCallback(
    (titles: I18nTitleEntry[]) => onUpdateRow(row.id, 'titles', titles),
    [onUpdateRow, row.id],
  )

  // Filter out already-selected items and apply local query
  const filteredOptions = useMemo(() => {
    const q = query.toLowerCase()
    const selectedIds = new Set(row.items.map((i) => i.variantId))
    return allVariantOptions
      .filter((opt) => !selectedIds.has(opt.value))
      .filter((opt) => getVariantLabel(opt.payload).toLowerCase().includes(q))
  }, [allVariantOptions, row.items, query, getVariantLabel])

  const renderOption = useCallback(
    (opt: { value: string; payload: BundleVariantResult }) => (
      <Card padding={3} radius={0} borderBottom>
        <Text size={1}>{getVariantLabel(opt.payload)}</Text>
      </Card>
    ),
    [getVariantLabel],
  )

  const renderValue = useCallback(() => '', [])

  const filterOption = useCallback(
    (inputValue: string, option: { value: string; payload: BundleVariantResult }) =>
      getVariantLabel(option.payload).toLowerCase().includes(inputValue.toLowerCase()),
    [getVariantLabel],
  )

  return (
    <VariantRow index={index}>
      <Stack space={4}>
        {/* Row header */}
        <Flex align="center" justify="space-between">
          <Text size={1} muted>
            {structureT.default('products.variant')} {index + 1}
          </Text>
          {canRemove && (
            <Button
              mode="bleed"
              tone="critical"
              icon={CloseIcon}
              onClick={handleRemoveRow}
              padding={2}
            />
          )}
        </Flex>

        {/* Selected items */}
        {row.items.length > 0 && (
          <Stack space={2}>
            {row.items.map((item) => (
              <BundleVariantRowItem
                key={item.variantId}
                item={item}
                rowId={row.id}
                onRemove={onRemoveItem}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </Stack>
        )}

        {/* Variant search */}
        <Stack space={2}>
          <Label size={1}>{schemaT.default('productVariant.title')}</Label>
          <Autocomplete
            id={`bundle-picker-${row.id}`}
            loading={loadingVariants}
            openButton
            options={filteredOptions}
            value=""
            placeholder={studioT('inputs.reference.search-placeholder')}
            onSelect={handleAddItem}
            onQueryChange={handleQueryChange}
            renderOption={renderOption}
            filterOption={filterOption}
            renderValue={renderValue}
          />
        </Stack>

        <I18nTitleInputs
          locales={locales}
          defaultLocale={defaultLocale}
          requiredLocales={[]}
          required={false}
          titles={row.titles}
          onChange={handleTitlesChange}
          placeholder={titlePlaceholder}
        />

        {/* Price + tax */}
        <Grid columns={2} gap={3}>
          <PriceField value={row.price} onChange={handlePriceChange} required={false} />
          <TaxCategoryField
            value={row.taxCategoryId}
            taxCategories={taxCategories}
            loadingTax={loadingTax}
            onTaxChange={handleTaxChange}
          />
        </Grid>
      </Stack>
    </VariantRow>
  )
})

export function BundleTab(props: BundleTabProps): ReactElement {
  const {
    titles,
    globalPrice,
    taxCategories,
    loadingTax,
    defaultLocale,
    locales,
    titlePlaceholder,
  } = props.global
  const { onSubmit, submitting, hideProductSection } = props
  const { sanityClient, localizer, format, componentT } = useITSContext()
  const toast = useToast()

  const [variants, setVariants] = useState<BundleVariantResult[]>([])
  const [loadingVariants, setLoadingVariants] = useState(true)
  const [rows, setRows] = useState<BundleVariantRow[]>([emptyBundleRow()])

  // Load all non-bundle active variants
  useEffect(() => {
    sanityClient
      .fetch<BundleVariantResult[]>(
        `*[_type == "productVariant" && kind != "bundle" && status == "active"]{
          _id,
          kind,
          "title": title,
          "productTitle": product->title,
          "wineVolume": wine.volume,
          "wineVintage": wine.vintage,
          "optionTitles": options[]->title
        }`,
      )
      .then(setVariants)
      .catch((err) => {
        toast.push({ status: 'error', title: 'Failed to load variants', description: err.message })
      })
      .finally(() => setLoadingVariants(false))
  }, [sanityClient, toast])

  const getVariantLabel = useCallback(
    (v: BundleVariantResult): string => {
      const productTitle = localizer.value(v.productTitle) ?? ''
      const variantTitle = localizer.value(v.title)
      if (variantTitle) return `${productTitle} — ${variantTitle}`

      if (v.kind === 'wine') {
        const parts = [
          v.wineVolume
            ? format.number(v.wineVolume / 1000, { style: 'unit', unit: 'liter' })
            : null,
          v.wineVintage ?? null,
        ].filter(Boolean)
        const sub = parts.join(' • ')
        return sub ? `${productTitle} — ${sub}` : productTitle
      }

      return productTitle || v._id
    },
    [localizer, format],
  )

  // const variantOptions = useMemo(() => {
  //   const q = query.toLowerCase()
  //   return variants
  //     .filter((v) => getVariantLabel(v).toLowerCase().includes(q))
  //     .map((v) => ({ value: v._id, payload: v }))
  // }, [variants, query, getVariantLabel])

  const allVariantOptions = useMemo(
    () => variants.map((v) => ({ value: v._id, payload: v })),
    [variants],
  )

  const addRow = useCallback(() => setRows((r) => [...r, emptyBundleRow()]), [])

  const removeRow = useCallback(
    (id: string) => setRows((r) => r.filter((row) => row.id !== id)),
    [],
  )

  const addItemToRow = useCallback(
    (rowId: string, variantId: string) => {
      const variant = variants.find((v) => v._id === variantId)
      if (!variant) return
      const label = getVariantLabel(variant)
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== rowId) return row
          // Prevent duplicate
          // eslint-disable-next-line max-nested-callbacks
          if (row.items.some((i) => i.variantId === variantId)) return row
          return {
            ...row,
            items: [...row.items, { variantId, variantLabel: label, quantity: '1' }],
          }
        }),
      )
    },
    [variants, getVariantLabel],
  )

  const removeItemFromRow = useCallback((rowId: string, variantId: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, items: row.items.filter((i) => i.variantId !== variantId) }
          : row,
      ),
    )
  }, [])

  const updateItemQuantity = useCallback((rowId: string, variantId: string, quantity: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              items: row.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
            }
          : row,
      ),
    )
  }, [])

  const updateRow = useCallback((id: string, key: keyof BundleVariantRow, val: any) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: val } : row)))
  }, [])

  const canSubmit = useMemo(() => {
    if (!hideProductSection) {
      const defaultTitle = titles.find((t) => t.locale === defaultLocale)?.value
      if (!defaultTitle?.trim()) return false
      if (!globalPrice && rows.some((r) => !r.price)) return false
    }
    if (rows.length === 0) return false
    if (rows.some((r) => r.items.length === 0)) return false
    return true
  }, [hideProductSection, titles, defaultLocale, globalPrice, rows])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    await onSubmit(rows)
    setRows([emptyBundleRow()])
  }, [canSubmit, onSubmit, rows])

  const content = (
    <Stack space={6}>
      {/* Bundle variant rows */}
      <Stack space={3}>
        <VariantSectionHeader count={rows.length} />

        {rows.map((row, index) => (
          <BundleVariantRowCard
            key={row.id}
            row={row}
            index={index}
            canRemove={rows.length > 1}
            allVariantOptions={allVariantOptions}
            loadingVariants={loadingVariants}
            taxCategories={taxCategories}
            loadingTax={loadingTax}
            locales={locales}
            defaultLocale={defaultLocale}
            titlePlaceholder={titlePlaceholder}
            globalPrice={globalPrice}
            getVariantLabel={getVariantLabel}
            onRemoveRow={removeRow}
            onAddItem={addItemToRow}
            onRemoveItem={removeItemFromRow}
            onQuantityChange={updateItemQuantity}
            onUpdateRow={updateRow}
          />
        ))}

        <Button
          mode="ghost"
          icon={AddIcon}
          text={componentT.default('productCreatorTool.addVariantButton.add', 'Add Variant')}
          onClick={addRow}
        />
      </Stack>
    </Stack>
  )

  return (
    <ProductTab
      global={props.global}
      submitting={submitting}
      rows={rows.length}
      canSubmit={canSubmit}
      handleSubmit={handleSubmit}
      content={content}
      hideProductSection={props.hideProductSection}
    />
  )
}
