/* eslint-disable max-nested-callbacks */
/* eslint-disable no-nested-ternary */
import { Box, Button, Card, Checkbox, Flex, Grid, Label, Select, Stack, Text } from '@sanity/ui'
import { Autocomplete } from '@sanity/ui/autocomplete'
import { useToast } from '@sanity/ui/toast'
import { ChangeEvent, ReactElement } from 'react'
import { memo, useCallback, useEffect, useId, useMemo, useState } from 'react'

import { CloseIcon, RestoreSuggestionIcon } from '../../../../assets/icons'
import { useITSContext } from '../../../../context/ITSCoreProvider'
import { VinofactWine } from '../../../../types'
import { publishedId, wineProductsLike } from '../../../../utils/existingProducts'
import { variantDetails } from '../../../../utils/variantLabel'
import { gridVolumes, gridWines, stripYear, visibleGridWines } from '../../../../utils/wineName'
import { WinePreview } from '../../WinePreview'
import { DuplicateLine, DuplicateNotice, srOnly, useExistingProducts } from '../duplicates'
import { AdvancedSection } from '../fields/AdvancedSection'
import { SectionHeading } from '../fields/SectionHeading'
import { I18nTitleInputs } from '../fields/I18nTitleField'
import { inheritedPriceLabel, inheritedTaxLabel } from '../fields/inherited'
import { LabelField } from '../fields/Label'
import { PriceField } from '../fields/PriceField'
import { TaxCategoryField } from '../fields/TaxCategoryField'
import { VariantRow } from '../fields/VariantRow'
import {
  emptyExtras,
  extrasSetCount,
  stockReason,
  VariantExtrasFields,
} from '../fields/VariantExtrasFields'
import { VariantSectionHeader } from '../fields/VariantSectionHeader'
import {
  I18nTitleEntry,
  SubmitCheck,
  SummaryLine,
  VariantExtras,
  WineOption,
  WineRow,
  WineTabProps,
  WineVariantCardProps,
} from '../ProductCreator.types'
import { ProductTab } from './ProductTab'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Newest rows shown before "show older" (O1). */
const OLDER_LIMIT = 5

/** Same key as `existingWineKeys`: `${vinofactWineId}:${volume}`. */
function cellKey(wineId: string, volume: number | string): string {
  return `${wineId}:${volume}`
}

type LabelDeps = Parameters<typeof variantDetails>[0]

/** "0,75 l" — the short litre label (also for a volume that is not in `BOTTLE_VOLUMES_ML`). */
function volumeLabel(deps: LabelDeps, volume: number): string {
  return variantDetails(deps, { kind: 'wine', wineVolume: volume }) || String(volume)
}

/** "Ried Steinberg 2023" — the VinoFact name, with the vintage unless the name already ends with it. */
function wineName(wine: VinofactWine): string {
  if (!wine.year || stripYear(wine.title) !== wine.title) return wine.title
  return `${wine.title} ${wine.year}`
}

/** "Ried Steinberg — 1,5 l • 2023" — submit reasons and the details list. */
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

function defaultTitle(titles: I18nTitleEntry[], locale: string): string {
  return titles.find((t) => t.locale === locale)?.value ?? ''
}

/** `titles` with the default locale's value replaced (or added); other locales untouched. */
function withDefaultTitle(
  titles: I18nTitleEntry[],
  locale: string,
  value: string,
): I18nTitleEntry[] {
  return titles.some((t) => t.locale === locale)
    ? titles.map((t) => (t.locale === locale ? { ...t, value } : t))
    : [...titles, { locale, value }]
}

const renderWineOption = (option: WineOption) => (
  <Card padding={3} radius={0} borderBottom>
    <WinePreview wine={option.payload} />
  </Card>
)

const filterWineOption = (query: string, option: WineOption) => {
  const { title, year } = option.payload
  return `${title} ${year ?? ''}`.toLowerCase().includes(query.toLowerCase())
}

const renderWineValue = (val: string, option?: WineOption): string => option?.payload.title ?? val

// ─── One ticked cell: price + advanced overrides ──────────────────────────────

const WineVariantCard = memo(function WineVariantCard(props: WineVariantCardProps) {
  const {
    row,
    index,
    label,
    loadingTax,
    taxCategories,
    locales,
    defaultLocale,
    titlePlaceholder,
    priceInherited,
    taxInherited,
    onUpdate,
    onRemove,
  } = props
  const { componentT, featureRegistry } = useITSContext()
  const handleRemove = useCallback(() => onRemove(row.id), [onRemove, row.id])
  const handleExtrasChange = useCallback(
    (key: keyof VariantExtras, value: string) => onUpdate(row.id, key, value),
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
  const setCount =
    (row.taxCategoryId ? 1 : 0) + (row.titles.some((t) => t.value) ? 1 : 0) + extrasSetCount(row)

  return (
    <VariantRow index={index}>
      <Stack gap={3}>
        <Flex align="center" justify="space-between" gap={2}>
          <Text size={1} weight="semibold">
            {label}
          </Text>
          <Button
            mode="bleed"
            tone="critical"
            icon={CloseIcon}
            onClick={handleRemove}
            padding={2}
            aria-label={componentT.default('productCreatorTool.a11y.removeRow', undefined, {
              label,
            })}
          />
        </Flex>
        <PriceField
          value={row.price}
          onChange={handlePriceChange}
          required={false}
          inheritedLabel={priceInherited}
        />
        <AdvancedSection setCount={setCount}>
          <Stack gap={4}>
            <VariantExtrasFields
              extras={row}
              showStock={featureRegistry.isFeatureEnabled('shop.stock')}
              onChange={handleExtrasChange}
            />
            {/* Tax override — empty inherits the product's, then the shop default */}
            <TaxCategoryField
              value={row.taxCategoryId}
              taxCategories={taxCategories}
              loadingTax={loadingTax}
              onTaxChange={handleTaxChange}
              inheritedLabel={taxInherited}
            />
            <I18nTitleInputs
              locales={locales}
              defaultLocale={defaultLocale}
              requiredLocales={[]}
              required={false}
              titles={row.titles}
              onChange={handleTitlesChange}
              placeholder={titlePlaceholder}
            />
          </Stack>
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
    shopDefaultTaxCategoryId,
    loadingTax,
    defaultLocale,
    onTitlesChange,
  } = props.global
  const { onSubmit, submitting, existingWineKeys, hideProductSection, seedWineIds } = props
  const ctx = useITSContext()
  const { vinofactClient, secretsLoading, sanityClient, constants, componentT, config } = ctx
  const { localizer, format } = ctx
  const toast = useToast()
  const labelDeps = useMemo(() => ({ localizer, format }), [localizer, format])

  const [wines, setWines] = useState<VinofactWine[]>([])
  const [loadingWines, setLoadingWines] = useState(true)
  /** Volumes (ml) of the wine variants in the dataset — the default grid columns. */
  const [usedVolumes, setUsedVolumes] = useState<number[]>([])
  // Default from config (`features.shop.vinofact.importBottleImages`); the checkbox overrides per run
  const [importBottleImages, setImportBottleImages] = useState(
    config.features.shop.vinofact.importBottleImages,
  )
  const bottleImagesId = useId()

  // Grid state
  const [pickedSeedId, setPickedSeedId] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<string[]>([])
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [extraVolumes, setExtraVolumes] = useState<number[]>([])
  const [showOlder, setShowOlder] = useState(false)
  /** Ticked cells by `cellKey` → the variant row they become. */
  const [cells, setCells] = useState<Record<string, WineRow>>({})
  /**
   * The title the suggestion last wrote. While the default-locale title still equals it, it
   * counts as unedited and follows the seed wine; any edit (also from another tab — the titles
   * are shared) makes it differ.
   */
  const [appliedTitle, setAppliedTitle] = useState('')
  const [addPickerKey, setAddPickerKey] = useState(0)

  const firstPickerId = useId()
  const addPickerId = useId()
  const addVolumeId = useId()
  const tableId = useId()

  const loadWines = useCallback(async () => {
    // Right after a reload the secrets (VinoFact token) are still loading: wait, this runs again
    // once they're there
    if (secretsLoading) return
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
  }, [vinofactClient, secretsLoading, toast, componentT])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch wines on mount
    loadWines()
  }, [loadWines])

  // Default columns: the volumes already in use (published is enough — it only picks columns)
  useEffect(() => {
    sanityClient
      .fetch<(number | null)[]>(
        `array::unique(*[_type == "productVariant" && kind == "wine" && defined(wine.volume)].wine.volume)`,
      )
      .then((vols) => setUsedVolumes(vols.filter((v): v is number => typeof v === 'number')))
      .catch((err) => {
        toast.push({
          status: 'error',
          title: componentT.default('productCreatorTool.errors.loadData'),
          description: err.message,
        })
      })
  }, [sanityClient, toast, componentT])

  // ─── Seed + grid rows ───────────────────────────────────────────────────────

  // Adding to a product: its wines seed the grid (ids gone from VinoFact are skipped).
  const productSeedIds = useMemo(
    () => (seedWineIds ?? []).filter((id) => wines.some((w) => w.id === id)),
    [seedWineIds, wines],
  )
  const seedIds = useMemo(
    () => (productSeedIds.length > 0 ? productSeedIds : pickedSeedId ? [pickedSeedId] : []),
    [productSeedIds, pickedSeedId],
  )
  const pickedSeed = useMemo(
    () => (pickedSeedId ? (wines.find((w) => w.id === pickedSeedId) ?? null) : null),
    [pickedSeedId, wines],
  )
  const rowsInGrid = useMemo(
    () => gridWines(wines, seedIds, addedIds, removedIds),
    [wines, seedIds, addedIds, removedIds],
  )

  // ─── Duplicate check (creating only, B3) ────────────────────────────────────

  const checkDuplicates = !hideProductSection
  const existing = useExistingProducts('wine', checkDuplicates, true)
  const [dupVariants, setDupVariants] = useState<
    { productId: string | null; vinofactWineId: string; volume: number | null }[]
  >([])
  const gridIdsKey = rowsInGrid.map((w) => w.id).join('|')

  useEffect(() => {
    if (!checkDuplicates || !gridIdsKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nothing to check
      setDupVariants([])
      return undefined
    }
    let cancelled = false
    sanityClient
      .fetch<typeof dupVariants>(
        `*[_type == "productVariant" && wine.vinofactWineId in $ids && !(_id in path("versions.**"))]{
          _id, "productId": product._ref, "vinofactWineId": wine.vinofactWineId, "volume": wine.volume
        }`,
        { ids: gridIdsKey.split('|') },
        { perspective: 'raw' },
      )
      .then((res) => {
        if (!cancelled) setDupVariants(res)
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
  }, [checkDuplicates, gridIdsKey, sanityClient, toast, componentT])

  /** Cells that can't be ticked: the product's variants (adding) or any product's (creating). */
  const existingKeys = useMemo(() => {
    const keys = new Set(existingWineKeys ?? [])
    for (const v of dupVariants) if (v.volume) keys.add(cellKey(v.vinofactWineId, v.volume))
    return keys
  }, [existingWineKeys, dupVariants])

  const duplicateLines = useMemo((): DuplicateLine[] => {
    if (!checkDuplicates) return []
    const products = new Map(existing.products.map((p) => [p.id, p]))
    const wineById = new Map(wines.map((w) => [w.id, w]))
    // Exact: "Ried Steinberg 2023 (0,75 l, 1,5 l) ist schon in X"
    const exact = new Map<string, { wineId: string; productId: string; volumes: number[] }>()
    for (const v of dupVariants) {
      if (!v.productId) continue
      const productId = publishedId(v.productId)
      const key = `${v.vinofactWineId}:${productId}`
      const entry = exact.get(key) ?? { wineId: v.vinofactWineId, productId, volumes: [] }
      if (v.volume && !entry.volumes.includes(v.volume)) entry.volumes.push(v.volume)
      exact.set(key, entry)
    }
    const lines: DuplicateLine[] = [...exact.entries()].map(([key, e]) => {
      const wine = wineById.get(e.wineId)
      const volumes = e.volumes.sort((a, b) => a - b).map((v) => volumeLabel(labelDeps, v))
      return {
        key,
        before: componentT.default('productCreatorTool.duplicates.wineExact', undefined, {
          wine: wine ? wineName(wine) : e.wineId,
          volumes: volumes.join(', '),
        }),
        product: products.get(e.productId) ?? { id: e.productId, title: '' },
      }
    })
    // Hint: a product whose title or wines have the seed wine's name
    if (pickedSeed) {
      const inExact = new Set([...exact.values()].map((e) => e.productId))
      const names = new Map(wines.map((w) => [w.id, w.title]))
      for (const product of wineProductsLike(
        existing.products,
        existing.variants,
        names,
        pickedSeed.title,
      )) {
        if (inExact.has(product.id)) continue
        lines.push({
          key: `like:${product.id}`,
          before: componentT.default('productCreatorTool.duplicates.wineLike'),
          product,
          after: componentT.default('productCreatorTool.duplicates.addVintagesThere'),
        })
      }
    }
    return lines
  }, [checkDuplicates, existing, wines, dupVariants, pickedSeed, labelDeps, componentT])

  // ─── Columns + visible rows ─────────────────────────────────────────────────

  const volumes = useMemo(() => {
    // Also the volumes of the existing keys (a draft variant's volume may not be published yet)
    const fromKeys = [...existingKeys].map((k) => Number(k.split(':').pop()))
    return gridVolumes([...usedVolumes, ...fromKeys], extraVolumes)
  }, [usedVolumes, existingKeys, extraVolumes])

  const keepVisible = useMemo(() => {
    const keep = new Set<string>([...seedIds, ...addedIds])
    for (const key of [...existingKeys, ...Object.keys(cells)]) {
      keep.add(key.slice(0, key.lastIndexOf(':')))
    }
    return keep
  }, [seedIds, addedIds, existingKeys, cells])

  const visibleRows = useMemo(
    () => (showOlder ? rowsInGrid : visibleGridWines(rowsInGrid, keepVisible, OLDER_LIMIT)),
    [showOlder, rowsInGrid, keepVisible],
  )
  const hiddenCount =
    rowsInGrid.length - visibleGridWines(rowsInGrid, keepVisible, OLDER_LIMIT).length

  /** Ticked, new cells in grid order (rows × columns) — the variants to create. */
  const submittableRows = useMemo(
    () =>
      rowsInGrid.flatMap((w) =>
        volumes
          .map((v) => cells[cellKey(w.id, v)])
          .filter((row): row is WineRow => !!row && !existingKeys.has(row.id)),
      ),
    [rowsInGrid, volumes, cells, existingKeys],
  )

  // ─── Grid operations ────────────────────────────────────────────────────────

  const toggleCell = useCallback((wine: VinofactWine, volume: number) => {
    const key = cellKey(wine.id, volume)
    setCells((prev) => {
      if (prev[key]) {
        const { [key]: _removed, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [key]: {
          id: key,
          wine,
          volume: String(volume),
          price: undefined,
          taxCategoryId: '',
          titles: [],
          ...emptyExtras(),
        },
      }
    })
  }, [])

  const dropCellsOf = useCallback((wineId: string) => {
    setCells((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([, row]) => row.wine?.id !== wineId)),
    )
  }, [])

  const removeWine = useCallback(
    (wineId: string) => {
      setRemovedIds((prev) => [...prev, wineId])
      setAddedIds((prev) => prev.filter((id) => id !== wineId))
      dropCellsOf(wineId)
    },
    [dropCellsOf],
  )

  const resetGrid = useCallback(() => {
    setPickedSeedId(null)
    setAddedIds([])
    setRemovedIds([])
    setCells({})
    setShowOlder(false)
  }, [])

  // ─── Title suggestion (creating only, B2) ───────────────────────────────────

  const suggestion = !hideProductSection && pickedSeed ? stripYear(pickedSeed.title) : ''
  const currentTitle = defaultTitle(titles, defaultLocale)

  /** Writes the suggestion into the default locale only; other locales stay as they are. */
  const applySuggestion = useCallback(
    (value: string) => {
      setAppliedTitle(value)
      onTitlesChange(withDefaultTitle(titles, defaultLocale, value))
    },
    [titles, defaultLocale, onTitlesChange],
  )

  const handlePickSeed = useCallback(
    (id: string) => {
      setPickedSeedId(id)
      setRemovedIds([])
      const wine = wines.find((w) => w.id === id)
      // Follows the seed until the editor edits the title
      if (wine && !hideProductSection && currentTitle === appliedTitle) {
        applySuggestion(stripYear(wine.title))
      }
    },
    [wines, hideProductSection, currentTitle, appliedTitle, applySuggestion],
  )

  const handleAddWine = useCallback((id: string) => {
    setAddedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setRemovedIds((prev) => prev.filter((r) => r !== id))
    // Remount the picker empty; focus goes back to it in the effect below
    setAddPickerKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (addPickerKey === 0) return
    document.getElementById(addPickerId)?.focus()
  }, [addPickerKey, addPickerId])

  const handleAddVolume = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.currentTarget.value)
    if (value) setExtraVolumes((prev) => [...prev, value])
  }, [])

  const updateRow = useCallback((id: string, key: keyof WineRow, val: any) => {
    setCells((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], [key]: val } } : prev))
  }, [])

  const removeRow = useCallback((id: string) => {
    setCells((prev) => {
      const { [id]: _removed, ...rest } = prev
      return rest
    })
  }, [])

  const allOptions = useMemo(
    () => wines.map((w): WineOption => ({ value: w.id, payload: w })),
    [wines],
  )
  const addOptions = useMemo(() => {
    const inGrid = new Set(rowsInGrid.map((w) => w.id))
    return allOptions.filter((o) => !inGrid.has(o.value))
  }, [allOptions, rowsInGrid])

  const titleInputId = useId()
  // The button disappears once the title equals the suggestion: move focus to the title input
  const restoreSuggestion = useCallback(() => {
    applySuggestion(suggestion)
    requestAnimationFrame(() => document.getElementById(titleInputId)?.focus())
  }, [applySuggestion, suggestion, titleInputId])

  const global = useMemo(
    () => ({
      ...props.global,
      titleInputId,
      // Before a wine is picked: say that the title can come from it
      ...(!hideProductSection &&
        !suggestion &&
        !currentTitle && {
          titleHint: componentT.default('productCreatorTool.wine.titleFromWineLater'),
        }),
      ...(suggestion && {
        titleHint:
          currentTitle === suggestion
            ? componentT.default('productCreatorTool.wine.titleFromVinofact')
            : componentT.default('productCreatorTool.wine.titleSuggestion', undefined, {
                title: suggestion,
              }),
        // Only while the title differs — when it equals the suggestion there's nothing to restore
        titleAction:
          currentTitle === suggestion ? undefined : (
            <Button
              mode="ghost"
              icon={RestoreSuggestionIcon}
              text={componentT.default('productCreatorTool.wine.restoreSuggestion')}
              onClick={restoreSuggestion}
            />
          ),
      }),
    }),
    [
      props.global,
      titleInputId,
      hideProductSection,
      suggestion,
      currentTitle,
      componentT,
      restoreSuggestion,
    ],
  )

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const submitCheck = useMemo((): SubmitCheck => {
    const reasons: string[] = []
    if (!hideProductSection && !currentTitle.trim()) {
      reasons.push(componentT.default('productCreatorTool.reasons.title'))
    }
    if (submittableRows.length === 0) {
      reasons.push(componentT.default('productCreatorTool.reasons.noWineCell'))
    }
    // Active variants need a price — the global (product) one or the row's (also when adding
    // variants to an existing product: `globalPrice` is then the product's price). A
    // "coming soon" variant may stay without one (as the schema's `activeNeedsPrice`).
    const key = hideProductSection ? 'priceMissingExisting' : 'priceMissing'
    for (const row of submittableRows) {
      const label = wineRowLabel(labelDeps, row)
      if (!globalPrice && !row.price && row.status === 'active') {
        reasons.push(componentT.default(`productCreatorTool.reasons.${key}`, undefined, { label }))
      }
      const stock = stockReason(componentT, label, row.stock)
      if (stock) reasons.push(stock)
    }
    return { ok: reasons.length === 0, reasons }
  }, [hideProductSection, currentTitle, globalPrice, submittableRows, componentT, labelDeps])

  const summaryLines = useMemo(
    (): SummaryLine[] =>
      submittableRows.map((row) => ({
        key: row.id,
        label: wineRowLabel(labelDeps, row),
        price: row.price ?? globalPrice,
        status: row.status,
      })),
    [submittableRows, labelDeps, globalPrice],
  )

  const handleSubmit = useCallback(async () => {
    if (!submitCheck.ok) return
    // Only new cells: a cell matching an existing variant is never created twice
    const ok = await onSubmit(submittableRows, {
      importBottleImages: !!vinofactClient && importBottleImages,
    })
    if (!ok) return // keep the editor's grid after a failed commit
    setCells({})
    setExtraVolumes([])
    setAppliedTitle('')
    // Creating: start over. Adding (the pane stays open): keep the grid, the reload turns the
    // new cells into existing ones.
    if (!hideProductSection) resetGrid()
  }, [
    submitCheck.ok,
    onSubmit,
    submittableRows,
    vinofactClient,
    importBottleImages,
    hideProductSection,
    resetGrid,
  ])

  // ─── Render ─────────────────────────────────────────────────────────────────

  const priceInherited = inheritedPriceLabel(componentT, format, globalPrice)
  const taxInherited = inheritedTaxLabel(
    componentT,
    taxCategories,
    globalTaxCategoryId,
    shopDefaultTaxCategoryId,
  )
  const addableVolumes = (constants.volumeOptions ?? []).filter((o) => !volumes.includes(o.value))
  const hasGrid = seedIds.length > 0
  const caption = componentT.default('productCreatorTool.wine.gridCaption')

  const firstPicker = (
    <Stack gap={2}>
      <Label as="label" htmlFor={firstPickerId} size={1}>
        {componentT.default('productCreatorTool.wine.pickFirst')} *
      </Label>
      <Autocomplete
        id={firstPickerId}
        loading={loadingWines}
        openButton
        options={allOptions}
        placeholder={ctx.studioT('inputs.reference.search-placeholder')}
        onSelect={handlePickSeed}
        renderOption={renderWineOption}
        filterOption={filterWineOption}
        renderValue={renderWineValue}
      />
      <Text size={1} muted>
        {componentT.default(
          hideProductSection
            ? 'productCreatorTool.wine.pickFirstHint'
            : 'productCreatorTool.wine.pickFirstHintTitle',
        )}
      </Text>
    </Stack>
  )

  const grid = (
    <Stack gap={3}>
      {/* Wide grids scroll inside their own (focusable, labelled) container, not the page */}
      <div
        role="region"
        aria-label={caption}
        // A scrollable region must be keyboard-reachable
        tabIndex={0}
        style={{ overflowX: 'auto', maxWidth: '100%' }}
      >
        <table id={tableId} style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
          <caption style={srOnly}>{caption}</caption>
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: 'start', padding: '0.5rem' }}>
                <Text size={1} weight="semibold">
                  {componentT.default('productCreatorTool.wine.wineColumn')}
                </Text>
              </th>
              {volumes.map((v) => (
                <th key={v} scope="col" style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>
                  <Text size={1} weight="semibold">
                    {volumeLabel(labelDeps, v)}
                  </Text>
                </th>
              ))}
              {/* Last column: remove the row (named for screen readers, empty visually) */}
              <th scope="col" style={{ padding: '0.5rem' }}>
                <span style={srOnly}>
                  {componentT.default('productCreatorTool.wine.removeColumn')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((w) => {
              const name = wineName(w)
              return (
                <tr key={w.id} style={{ borderTop: '1px solid var(--card-border-color)' }}>
                  <th scope="row" style={{ textAlign: 'start', padding: '0.25rem 0.5rem' }}>
                    <Text size={1} weight="regular">
                      {stripYear(w.title)} <span style={{ opacity: 0.7 }}>{w.year ?? '—'}</span>
                    </Text>
                  </th>
                  {volumes.map((v) => {
                    const key = cellKey(w.id, v)
                    const exists = existingKeys.has(key)
                    const cellName = componentT.default(
                      exists
                        ? 'productCreatorTool.wine.cellLabelExisting'
                        : 'productCreatorTool.wine.cellLabel',
                      undefined,
                      { wine: name, volume: volumeLabel(labelDeps, v) },
                    )
                    return (
                      <td key={v} style={{ textAlign: 'center', padding: '0.25rem 0.5rem' }}>
                        <Checkbox
                          checked={exists || !!cells[key]}
                          disabled={exists}
                          aria-label={cellName}
                          title={exists ? cellName : undefined}
                          onChange={() => toggleCell(w, v)}
                        />
                      </td>
                    )
                  })}
                  <td style={{ textAlign: 'end', padding: '0.25rem 0.5rem' }}>
                    <Button
                      mode="bleed"
                      icon={CloseIcon}
                      padding={2}
                      onClick={() => removeWine(w.id)}
                      aria-label={componentT.default(
                        'productCreatorTool.a11y.removeWine',
                        undefined,
                        {
                          title: name,
                        },
                      )}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rowsInGrid.length === 0 && (
        <Text size={1} muted>
          {componentT.default('productCreatorTool.wine.gridEmpty')}
        </Text>
      )}

      <Flex gap={3} wrap="wrap" align="center">
        {(hiddenCount > 0 || showOlder) && (
          <Button
            mode="ghost"
            text={
              showOlder
                ? componentT.default('productCreatorTool.wine.hideOlder')
                : componentT.default('productCreatorTool.wine.showOlder', undefined, {
                    count: hiddenCount,
                  })
            }
            aria-expanded={showOlder}
            aria-controls={tableId}
            onClick={() => setShowOlder((s) => !s)}
          />
        )}
        <Text size={1} muted>
          {componentT.default('productCreatorTool.wine.gridLegend')}
        </Text>
      </Flex>

      <Grid gridTemplateColumns={[1, 1, 2]} gap={3}>
        {/* Another wine, e.g. a renamed vintage ("Ried Steinberg" → "Steinberg 1ÖTW") */}
        <Stack gap={2}>
          <Label as="label" htmlFor={addPickerId} size={1}>
            {componentT.default('productCreatorTool.wine.addWine')}
          </Label>
          <Autocomplete
            key={addPickerKey}
            id={addPickerId}
            loading={loadingWines}
            openButton
            options={addOptions}
            placeholder={ctx.studioT('inputs.reference.search-placeholder')}
            onSelect={handleAddWine}
            renderOption={renderWineOption}
            filterOption={filterWineOption}
            renderValue={renderWineValue}
          />
        </Stack>
        {addableVolumes.length > 0 && (
          <LabelField
            id={addVolumeId}
            title={componentT.default('productCreatorTool.wine.addVolume')}
          >
            <Select id={addVolumeId} value="" onChange={handleAddVolume}>
              <option value="">—</option>
              {addableVolumes.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.title}
                </option>
              ))}
            </Select>
          </LabelField>
        )}
      </Grid>
    </Stack>
  )

  const content = (
    <Stack gap={5}>
      {/* Step: pick the wine, tick the bottles */}
      <Card border radius={2} padding={4}>
        <Stack gap={4}>
          <VariantSectionHeader
            count={submittableRows.length}
            title={componentT.default('productCreatorTool.wine.sectionTitle')}
            description={componentT.default('productCreatorTool.wine.sectionDescription')}
          />

          {loadingWines ? (
            <Text size={1} muted>
              {componentT.default('productCreatorTool.wine.loadingWines')}
            </Text>
          ) : hasGrid ? (
            <Stack gap={4}>
              {/* The picked first wine (creating) — clearing it starts the grid over */}
              {pickedSeed && productSeedIds.length === 0 && (
                <Card border radius={2} padding={2}>
                  <Flex align="center" gap={2}>
                    <Box flex={1}>
                      <WinePreview wine={pickedSeed} />
                    </Box>
                    <Button
                      mode="bleed"
                      icon={CloseIcon}
                      padding={2}
                      onClick={resetGrid}
                      aria-label={componentT.default(
                        'productCreatorTool.a11y.clearWine',
                        undefined,
                        { title: pickedSeed.title },
                      )}
                    />
                  </Flex>
                </Card>
              )}
              <DuplicateNotice lines={duplicateLines} />
              {grid}
            </Stack>
          ) : (
            firstPicker
          )}
        </Stack>
      </Card>

      {/* Next step, once the grid is there: one card per ticked cell (price; under "Advanced"
          status, SKU, stock, tax, own title) */}
      {hasGrid && (
        <Card border radius={2} padding={4}>
          <Stack gap={4}>
            <SectionHeading
              title={componentT.default('productCreatorTool.wine.detailsTitle')}
              description={componentT.default('productCreatorTool.wine.detailsDescription')}
            />
            {submittableRows.length > 0 ? (
              <Stack gap={2}>
                {submittableRows.map((row, index) => (
                  <WineVariantCard
                    key={row.id}
                    row={row}
                    index={index}
                    label={wineRowLabel(labelDeps, row)}
                    loadingTax={loadingTax}
                    taxCategories={taxCategories}
                    locales={props.global.locales}
                    defaultLocale={defaultLocale}
                    titlePlaceholder={props.global.titlePlaceholder}
                    priceInherited={priceInherited}
                    taxInherited={taxInherited}
                    onUpdate={updateRow}
                    onRemove={removeRow}
                  />
                ))}
              </Stack>
            ) : (
              <Text size={1} muted>
                {componentT.default('productCreatorTool.wine.noCellYet')}
              </Text>
            )}
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
        </Card>
      )}
    </Stack>
  )

  return (
    <ProductTab
      global={global}
      submitting={submitting}
      rows={submittableRows.length}
      submitCheck={submitCheck}
      handleSubmit={handleSubmit}
      content={content}
      hideProductSection={hideProductSection}
      summaryLines={summaryLines}
    />
  )
}
