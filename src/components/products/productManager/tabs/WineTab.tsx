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
  Select,
  Stack,
  Text,
  useToast,
} from '@sanity/ui'
import { ChangeEvent, ReactElement } from 'react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { AddIcon, CloseIcon } from '../../../../assets/icons'
import { useITSContext } from '../../../../context/ITSCoreProvider'
import { VinofactWine } from '../../../../types'
import { uid } from '../../../../utils/utils'
import { WinePreview } from '../../WinePreview'
import { I18nTitleInputs } from '../fields/I18nTitleField'
import { PriceField } from '../fields/PriceField'
import { TaxCategoryField } from '../fields/TaxCategoryField'
import { VariantSectionHeader } from '../fields/VariantSectionHeader'
import {
  I18nTitleEntry,
  WineOption,
  WineRow,
  WineRowCardProps,
  WineTabProps,
} from '../ProductCreator.types'
import { ProductTab } from './ProductTab'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyWineRow(): WineRow {
  return { id: uid(), wine: null, volume: '750', price: '', taxCategoryId: '', titles: [] }
}

function stripYear(title: string): string {
  return title.replace(/\s*\d{4}\s*$/, '').trim()
}

const WineRowCard = memo(function WineRowCard(props: WineRowCardProps) {
  const {
    row,
    index,
    canRemove,
    options,
    loadingWines,
    loadingTax,
    taxCategories,
    volumeOptions,
    locales,
    defaultLocale,
    titlePlaceholder,
    onUpdate,
    onRemove,
    onQueryChange,
  } = props
  const { schemaT, structureT, studioT } = useITSContext()
  const handleRemove = useCallback(() => onRemove(row.id), [onRemove, row.id])
  const handleClearWine = useCallback(() => onUpdate(row.id, 'wine', null), [onUpdate, row.id])

  const handleSelectWine = useCallback(
    (id: string) => {
      const wine = options.find((o) => o.value === id)?.payload ?? null
      onUpdate(row.id, 'wine', wine)
    },
    [onUpdate, row.id, options],
  )

  const handleQueryChange = useCallback(
    (q: string | null) => onQueryChange(row.id, q ?? ''),
    [onQueryChange, row.id],
  )

  const handleVolumeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => onUpdate(row.id, 'volume', e.currentTarget.value),
    [onUpdate, row.id],
  )

  const handlePriceChange = useCallback(
    (value: string) => onUpdate(row.id, 'price', value),
    [onUpdate, row.id],
  )

  const handleTaxChange = useCallback(
    (value: string) => onUpdate(row.id, 'taxCategoryId', value),
    [onUpdate, row.id],
  )

  const handleTitlesChange = useCallback(
    (titles: I18nTitleEntry[]) => onUpdate(row.id, 'titles', titles),
    [onUpdate, row.id],
  )

  const renderOption = useCallback(
    (option: WineOption) => (
      <Card padding={3} radius={0} borderBottom>
        <WinePreview wine={option.payload} />
      </Card>
    ),
    [],
  )

  const filterOption = useCallback((query: string, option: WineOption) => {
    const { title, year } = option.payload
    return `${title} ${year}`.toLowerCase().includes(query.toLowerCase())
  }, [])

  const renderValue = useCallback(
    (val: string, option?: WineOption): string => option?.payload.title ?? val,
    [],
  )

  return (
    <Card border radius={2} padding={4}>
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
              onClick={handleRemove}
              padding={2}
            />
          )}
        </Flex>

        {/* Wine picker */}
        <Stack space={2}>
          <Label size={1}>{schemaT.default('wine.fields.vinofactWineId.title')} *</Label>
          {row.wine ? (
            <Card border radius={2} padding={2}>
              <Flex align="center" gap={2}>
                <Box flex={1}>
                  <WinePreview wine={row.wine} />
                </Box>
                <Button mode="bleed" icon={CloseIcon} padding={2} onClick={handleClearWine} />
              </Flex>
            </Card>
          ) : (
            <Autocomplete
              id={`wine-picker-${row.id}`}
              loading={loadingWines}
              openButton
              options={options}
              placeholder={studioT('inputs.reference.search-placeholder')}
              onSelect={handleSelectWine}
              onQueryChange={handleQueryChange}
              renderOption={renderOption}
              filterOption={filterOption}
              renderValue={renderValue}
            />
          )}
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

        <Grid columns={[1, 1, 3]} gap={3}>
          {/* Volume */}
          <Stack space={2}>
            <Label size={1}>{schemaT.default('productVariant.fields.volume.title')} *</Label>
            <Select value={row.volume} onChange={handleVolumeChange}>
              <option value="">—</option>
              {volumeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.title}
                </option>
              ))}
            </Select>
          </Stack>

          {/* Price override */}
          <PriceField value={row.price} onChange={handlePriceChange} required={false} />

          {/* Tax override */}
          <TaxCategoryField
            value={row.taxCategoryId}
            taxCategories={taxCategories}
            loadingTax={loadingTax}
            onTaxChange={handleTaxChange}
          />
          {/* <Stack space={2}>
            <Label size={1}>Tax Category override</Label>
            <Select value={row.taxCategoryId} onChange={handleTaxChange} disabled={loadingTax}>
              <option value="">-</option>
              {taxCategories.map((tc) => (
                <option key={tc._id} value={tc._id}>
                  {tc.title} ({tc.code})
                </option>
              ))}
            </Select>
          </Stack> */}
        </Grid>
      </Stack>
    </Card>
  )
})
// ─── Wine Tab ─────────────────────────────────────────────────────────────────

export function WineTab(props: WineTabProps): ReactElement {
  const {
    titles,
    globalPrice,
    globalTaxCategoryId,
    taxCategories,
    loadingTax,
    locales,
    defaultLocale,
    onTitlesChange,
  } = props.global
  const { onSubmit, submitting } = props
  const { vinofactClient, constants, componentT } = useITSContext()
  const toast = useToast()

  const [wines, setWines] = useState<VinofactWine[]>([])
  const [loadingWines, setLoadingWines] = useState(true)
  const [rows, setRows] = useState<WineRow[]>([emptyWineRow()])
  const [queries, setQueries] = useState<Record<string, string>>({})
  const titleAutoSet = useRef(false)

  const loadWines = useCallback(async () => {
    if (!vinofactClient) {
      toast.push({
        status: 'error',
        title: componentT.default('vinofact.notInitialized.title'),
        description: componentT.default('vinofact.notInitialized.description'),
      })
      setLoadingWines(false)
      return
    }

    try {
      const data = await vinofactClient.getWines()
      const sorted = [...data.wines].sort((a, b) => {
        const titleComp = a.title.localeCompare(b.title)
        return titleComp === 0 ? (Number(b.year) || 0) - (Number(a.year) || 0) : titleComp
      })
      setWines(sorted)
    } catch (err: any) {
      toast.push({
        status: 'error',
        title: componentT.default('vinofact.winesLoadedError.description'),
        description: err.message,
      })
    } finally {
      setLoadingWines(false)
    }
  }, [vinofactClient, toast, componentT])

  // Load wines from Vinofact
  useEffect(() => {
    loadWines()
  }, [loadWines])

  // Auto-suggest product title from first selected wine
  useEffect(() => {
    if (titleAutoSet.current) return
    const firstWine = rows.find((r) => r.wine)?.wine
    if (!firstWine) return
    const suggested = stripYear(firstWine.title)
    const defaultEntry = titles.find((t) => t.locale === defaultLocale)
    // Only auto-set if default locale title is still empty
    if (!defaultEntry?.value) {
      onTitlesChange(
        locales.map((locale) => ({
          locale,
          value: locale === defaultLocale ? suggested : '',
        })),
      )
      titleAutoSet.current = true
    }
  }, [rows, titles, defaultLocale, locales, onTitlesChange])

  // Row operations
  const addRow = useCallback(() => setRows((r) => [...r, emptyWineRow()]), [])

  const addNextVintage = useCallback(() => {
    // Find the last selected wine — pre-filter new row to that wine's base name
    const lastWine = [...rows].reverse().find((r) => r.wine)?.wine
    const newRow = emptyWineRow()
    setRows((r) => [...r, newRow])
    if (lastWine) {
      // Pre-set query for new row to the base wine name so dropdown opens filtered
      setQueries((prev) => ({ ...prev, [newRow.id]: stripYear(lastWine.title) }))
    }
  }, [rows])

  const removeRow = useCallback(
    (id: string) => setRows((r) => r.filter((row) => row.id !== id)),
    [],
  )

  const updateRow = useCallback((id: string, key: keyof WineRow, val: any) => {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [key]: val } : row)))
  }, [])

  const handleQueryChange = useCallback((id: string, q: string) => {
    setQueries((prev) => ({ ...prev, [id]: q }))
  }, [])

  // Exclude already-selected wines from other rows' options
  const selectedWineIds = useMemo(
    () => new Set(rows.map((r) => r.wine?.id).filter(Boolean)),
    [rows],
  )

  const optionsPerRow = useMemo(() => {
    return Object.fromEntries(
      rows.map((row) => {
        const q = (queries[row.id] ?? '').toLowerCase()
        const opts = wines
          .filter((w) => !selectedWineIds.has(w.id) || w.id === row.wine?.id)
          .filter((w) => `${w.title} ${w.year ?? ''}`.toLowerCase().includes(q))
          .map((w): WineOption => ({ value: w.id, payload: w }))
        return [row.id, opts]
      }),
    )
  }, [wines, selectedWineIds, queries, rows])

  const canSubmit = useMemo(() => {
    const defaultTitle = titles.find((t) => t.locale === defaultLocale)?.value
    if (!defaultTitle?.trim()) return false
    if (!globalPrice && rows.some((r) => !r.price)) return false
    if (rows.length === 0) return false
    if (rows.some((r) => !r.wine || !r.volume)) return false
    return true
  }, [titles, defaultLocale, globalPrice, rows])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    await onSubmit(rows)
    // Reset wine-specific state on success
    setRows([emptyWineRow()])
    setQueries({})
    titleAutoSet.current = false
  }, [canSubmit, onSubmit, rows])

  const volumeOptions = constants.volumeOptions ?? []
  const lastSelectedWine = [...rows].reverse().find((r) => r.wine)?.wine

  const content = (
    <Stack space={3}>
      <VariantSectionHeader count={rows.length} />

      {rows.map((row, index) => (
        <WineRowCard
          key={row.id}
          row={row}
          index={index}
          canRemove={rows.length > 1}
          options={optionsPerRow[row.id] ?? []}
          loadingWines={loadingWines}
          loadingTax={loadingTax}
          taxCategories={taxCategories}
          volumeOptions={volumeOptions}
          globalPrice={globalPrice}
          globalTaxCategoryId={globalTaxCategoryId}
          locales={props.global.locales}
          defaultLocale={props.global.defaultLocale}
          titlePlaceholder={props.global.titlePlaceholder}
          onUpdate={updateRow}
          onRemove={removeRow}
          onQueryChange={handleQueryChange}
        />
      ))}

      <Flex gap={2}>
        {/* Quick "add next vintage" when a wine has been selected */}
        {lastSelectedWine ? (
          <Button
            mode="ghost"
            icon={AddIcon}
            text={componentT.default(
              'productCreatorTool.addVariantButton.addAnother',
              'Add another',
              { title: lastSelectedWine.title },
            )}
            // text={`Add another ${stripYear(lastSelectedWine.title)} vintage`}
            onClick={addNextVintage}
          />
        ) : (
          <Button
            mode="ghost"
            icon={AddIcon}
            text={componentT.default('productCreatorTool.addVariantButton.add', 'Add Variant')}
            onClick={addRow}
          />
        )}
      </Flex>
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
    />
  )
}
