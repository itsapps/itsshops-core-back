/* eslint-disable max-nested-callbacks */
/* eslint-disable no-nested-ternary */
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Grid,
  Label,
  Select,
  Stack,
  Text,
} from '@sanity/ui'
import { Autocomplete } from '@sanity/ui/autocomplete'
import { useToast } from '@sanity/ui/toast'
import { ChangeEvent, ReactElement } from 'react'
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { AddIcon, CloseIcon } from '../../../../assets/icons'
import { useITSContext } from '../../../../context/ITSCoreProvider'
import { VinofactWine } from '../../../../types'
import { uid } from '../../../../utils/utils'
import { variantDetails } from '../../../../utils/variantLabel'
import { AdvancedSection } from '../fields/AdvancedSection'
import { WinePreview } from '../../WinePreview'
import { I18nTitleInputs } from '../fields/I18nTitleField'
import { PriceField } from '../fields/PriceField'
import { TaxCategoryField } from '../fields/TaxCategoryField'
import { VariantRow } from '../fields/VariantRow'
import { VariantSectionHeader } from '../fields/VariantSectionHeader'
import {
  I18nTitleEntry,
  WineOption,
  WineRow,
  SubmitCheck,
  WineRowCardProps,
  WineTabProps,
} from '../ProductCreator.types'
import { ProductTab } from './ProductTab'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyWineRow(): WineRow {
  return { id: uid(), wine: null, volume: '750', price: undefined, taxCategoryId: '', titles: [] }
}

function stripYear(title: string): string {
  return title.replace(/\s*\d{4}\s*$/, '').trim()
}

type LabelDeps = Parameters<typeof variantDetails>[0]

/** "Ried Steinberg — 1,5 l • 2023" — used in submit reasons. */
function wineRowLabel(deps: LabelDeps, row: WineRow): string {
  if (!row.wine) return ''
  return [
    stripYear(row.wine.title),
    variantDetails(deps, {
      kind: 'wine',
      wineVolume: Number(row.volume),
      wineVintage: row.wine.year,
    }),
  ]
    .filter(Boolean)
    .join(' — ')
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
    existingWineKeys,
    onUpdate,
    onRemove,
    onQueryChange,
  } = props
  const { schemaT, structureT, studioT, componentT } = useITSContext()
  const handleRemove = useCallback(() => onRemove(row.id), [onRemove, row.id])
  const handleClearWine = useCallback(() => onUpdate(row.id, 'wine', null), [onUpdate, row.id])
  const volumeId = useId()
  const pickerId = `wine-picker-${row.id}`
  const rowLabel = `${structureT.default('products.variant')} ${index + 1}`

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
    (value: number | undefined) => onUpdate(row.id, 'price', value),
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

  const isExisting = useMemo(() => {
    if (!row.wine || !row.volume) return false
    return existingWineKeys?.has(`${row.wine.id}:${row.volume}`) ?? false
  }, [row.wine, row.volume, existingWineKeys])

  return (
    <VariantRow index={index}>
      <Stack gap={4}>
        {/* Row header */}
        <Flex align="center" justify="space-between">
          <Text size={1} muted>
            {rowLabel}
          </Text>
          {isExisting && (
            <Badge tone="caution">
              {componentT.default('productCreatorTool.messages.variantExists')}
            </Badge>
          )}
          {canRemove && (
            <Button
              mode="bleed"
              tone="critical"
              icon={CloseIcon}
              onClick={handleRemove}
              padding={2}
              aria-label={componentT.default('productCreatorTool.a11y.removeRow', undefined, {
                label: rowLabel,
              })}
            />
          )}
        </Flex>

        {/* Wine picker */}
        <Stack gap={2}>
          {row.wine ? (
            <Label size={1}>{schemaT.default('wine.fields.vinofactWineId.title')} *</Label>
          ) : (
            <Label as="label" htmlFor={pickerId} size={1}>
              {schemaT.default('wine.fields.vinofactWineId.title')} *
            </Label>
          )}
          {row.wine ? (
            <Card border radius={2} padding={2}>
              <Flex align="center" gap={2}>
                <Box flex={1}>
                  <WinePreview wine={row.wine} />
                </Box>
                <Button
                  mode="bleed"
                  icon={CloseIcon}
                  padding={2}
                  onClick={handleClearWine}
                  aria-label={componentT.default('productCreatorTool.a11y.clearWine', undefined, {
                    title: row.wine.title,
                  })}
                />
              </Flex>
            </Card>
          ) : (
            <Autocomplete
              id={pickerId}
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

        <Grid gridTemplateColumns={[1, 1, 2]} gap={3}>
          {/* Volume */}
          <Stack gap={2}>
            <Label as="label" htmlFor={volumeId} size={1}>
              {schemaT.default('productVariant.fields.volume.title')} *
            </Label>
            <Select id={volumeId} value={row.volume} onChange={handleVolumeChange}>
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
        </Grid>

        {/* Tax override — empty inherits the product's, then the shop default */}
        <AdvancedSection setCount={row.taxCategoryId ? 1 : 0}>
          <TaxCategoryField
            value={row.taxCategoryId}
            taxCategories={taxCategories}
            loadingTax={loadingTax}
            onTaxChange={handleTaxChange}
          />
        </AdvancedSection>
      </Stack>
    </VariantRow>
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
    defaultLocale,
    onTitlesChange,
  } = props.global
  const { onSubmit, submitting, existingWineKeys, hideProductSection } = props
  const { vinofactClient, constants, componentT, config, localizer, format } = useITSContext()
  const toast = useToast()

  const [wines, setWines] = useState<VinofactWine[]>([])
  const [loadingWines, setLoadingWines] = useState(true)
  const [rows, setRows] = useState<WineRow[]>([emptyWineRow()])
  const [queries, setQueries] = useState<Record<string, string>>({})
  const titleAutoSet = useRef(false)
  // Default from config (`features.shop.vinofact.importBottleImages`); the checkbox overrides per run
  const [importBottleImages, setImportBottleImages] = useState(
    config.features.shop.vinofact.importBottleImages,
  )
  const bottleImagesId = useId()

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
        title: componentT.default('vinofact.winesLoadedError.title'),
        description: err.message,
      })
    } finally {
      setLoadingWines(false)
    }
  }, [vinofactClient, toast, componentT])

  // Load wines from Vinofact
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch wines on mount
    loadWines()
  }, [loadWines])

  // Auto-suggest product title from first selected wine
  useEffect(() => {
    if (titleAutoSet.current) return
    const firstWine = rows.find((r) => r.wine)?.wine
    if (!firstWine) return
    const suggested = stripYear(firstWine.title)
    const defaultEntry = titles.find((t) => t.locale === defaultLocale)
    // Only auto-set if default locale title is still empty; other locales stay as they are
    if (!defaultEntry?.value) {
      onTitlesChange(
        defaultEntry
          ? titles.map((t) => (t.locale === defaultLocale ? { ...t, value: suggested } : t))
          : [...titles, { locale: defaultLocale, value: suggested }],
      )
      titleAutoSet.current = true
    }
  }, [rows, titles, defaultLocale, onTitlesChange])

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

  const optionsPerRow = useMemo(() => {
    return Object.fromEntries(
      rows.map((row) => {
        const q = (queries[row.id] ?? '').toLowerCase()
        const opts = wines
          .filter((w) => `${w.title} ${w.year ?? ''}`.toLowerCase().includes(q))
          .map((w): WineOption => ({ value: w.id, payload: w }))
        return [row.id, opts]
      }),
    )
  }, [wines, queries, rows])

  const submittableRows = useMemo(
    () =>
      rows.filter((r) => {
        if (!r.wine || !r.volume) return false
        return !existingWineKeys?.has(`${r.wine.id}:${r.volume}`)
      }),
    [rows, existingWineKeys],
  )

  const submitCheck = useMemo((): SubmitCheck => {
    const reasons: string[] = []
    if (!hideProductSection) {
      const defaultTitle = titles.find((t) => t.locale === defaultLocale)?.value
      if (!defaultTitle?.trim())
        reasons.push(componentT.default('productCreatorTool.reasons.title'))
    }
    if (submittableRows.length === 0) {
      reasons.push(componentT.default('productCreatorTool.reasons.noVariant'))
    }
    // Active variants need a price — the global (product) one or the row's (also when adding
    // variants to an existing product: `globalPrice` is then the product's price).
    if (!globalPrice) {
      const key = hideProductSection ? 'priceMissingExisting' : 'priceMissing'
      for (const row of submittableRows.filter((r) => !r.price)) {
        reasons.push(
          componentT.default(`productCreatorTool.reasons.${key}`, undefined, {
            label: wineRowLabel({ localizer, format }, row),
          }),
        )
      }
    }
    return { ok: reasons.length === 0, reasons }
  }, [
    hideProductSection,
    titles,
    defaultLocale,
    globalPrice,
    submittableRows,
    componentT,
    localizer,
    format,
  ])

  const handleSubmit = useCallback(async () => {
    if (!submitCheck.ok) return
    // Only new rows: a row matching an existing variant is never created twice
    const ok = await onSubmit(submittableRows, {
      importBottleImages: !!vinofactClient && importBottleImages,
    })
    if (!ok) return // keep the editor's rows after a failed commit
    setRows([emptyWineRow()])
    setQueries({})
    titleAutoSet.current = false
  }, [submitCheck.ok, onSubmit, submittableRows, vinofactClient, importBottleImages])

  const volumeOptions = constants.volumeOptions ?? []
  const lastSelectedWine = [...rows].reverse().find((r) => r.wine)?.wine

  const content = (
    <Stack gap={3}>
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
          existingWineKeys={props.existingWineKeys}
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

      {/* Copy each new variant's VinoFact bottle image into its image after creating it */}
      {vinofactClient && (
        <Flex align="center" gap={2}>
          <Checkbox
            id={bottleImagesId}
            checked={importBottleImages}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setImportBottleImages(e.currentTarget.checked)
            }
          />
          <Box flex={1}>
            <Text size={1}>
              <label htmlFor={bottleImagesId}>
                {componentT.default('vinofact.bottleImages.checkbox')}
              </label>
            </Text>
          </Box>
        </Flex>
      )}
    </Stack>
  )

  return (
    <ProductTab
      global={props.global}
      submitting={submitting}
      rows={rows.length}
      submitCheck={submitCheck}
      handleSubmit={handleSubmit}
      content={content}
      hideProductSection={props.hideProductSection}
    />
  )
}
