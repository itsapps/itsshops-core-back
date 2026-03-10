import {
  Autocomplete,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Label,
  Select,
  Stack,
  Text,
  TextInput,
  useToast,
} from '@sanity/ui'
import { AddIcon, CloseIcon } from '@sanity/icons'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useClient } from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'
import { VinofactWine } from '../../types'
import { WinePreview } from './WinePreview'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaxCategory {
  _id: string
  title: string
  code: string
}

interface WineRow {
  id: string
  wine: VinofactWine | null
  volume: string
  price: string
  taxCategoryId: string
}

interface WineOption {
  value: string
  payload: VinofactWine
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2)
}

function emptyRow(): WineRow {
  return { id: uid(), wine: null, volume: '', price: '', taxCategoryId: '' }
}

// ─── WineRowCard ──────────────────────────────────────────────────────────────
// Extracted into its own memoized component so handlers are stable and only
// this row re-renders when its own state changes, not the entire list.

interface WineRowCardProps {
  row: WineRow
  index: number
  canRemove: boolean
  options: WineOption[]
  loadingWines: boolean
  loadingTax: boolean
  taxCategories: TaxCategory[]
  volumeOptions: { value: number; title?: string }[]
  globalPrice: string
  globalTaxCategoryId: string
  onUpdate: (id: string, key: keyof WineRow, val: any) => void
  onRemove: (id: string) => void
  onQueryChange: (id: string, query: string) => void
}

const WineRowCard = memo(function WineRowCard({
  row,
  index,
  canRemove,
  options,
  loadingWines,
  loadingTax,
  taxCategories,
  volumeOptions,
  globalPrice,
  globalTaxCategoryId,
  onUpdate,
  onRemove,
  onQueryChange,
}: WineRowCardProps) {
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
    (e: React.ChangeEvent<HTMLSelectElement>) => onUpdate(row.id, 'volume', e.currentTarget.value),
    [onUpdate, row.id],
  )

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onUpdate(row.id, 'price', e.currentTarget.value),
    [onUpdate, row.id],
  )

  const handleTaxChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      onUpdate(row.id, 'taxCategoryId', e.currentTarget.value),
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

  const renderValue = useCallback(
    (val: string, option?: WineOption): string => option?.payload.title ?? val,
    [],
  )

  return (
    <Card border radius={2} padding={4}>
      <Stack space={4}>
        <Flex align="center" justify="space-between">
          <Text size={1} muted>
            Variant {index + 1}
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
          <Label size={1}>Wine *</Label>
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
              placeholder="Search wines…"
              onSelect={handleSelectWine}
              onQueryChange={handleQueryChange}
              renderOption={renderOption}
              renderValue={renderValue}
            />
          )}
        </Stack>

        <Grid columns={[1, 1, 3]} gap={3}>
          {/* Volume */}
          <Stack space={2}>
            <Label size={1}>Volume *</Label>
            <Select value={row.volume} onChange={handleVolumeChange}>
              <option value="">— select —</option>
              {volumeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.title ?? `${opt.value} ml`}
                </option>
              ))}
            </Select>
          </Stack>

          {/* Price override */}
          <Stack space={2}>
            <Label size={1}>
              Price override
              {globalPrice && !row.price && (
                <Text as="span" size={0} muted>
                  {' '}
                  (using {globalPrice})
                </Text>
              )}
            </Label>
            <TextInput
              type="number"
              value={row.price}
              onChange={handlePriceChange}
              placeholder={globalPrice || 'e.g. 24.90'}
            />
          </Stack>

          {/* Tax category override */}
          <Stack space={2}>
            <Label size={1}>Tax Category override</Label>
            <Select value={row.taxCategoryId} onChange={handleTaxChange} disabled={loadingTax}>
              <option value="">{globalTaxCategoryId ? '— using default —' : '— none —'}</option>
              {taxCategories.map((tc) => (
                <option key={tc._id} value={tc._id}>
                  {tc.title} ({tc.code})
                </option>
              ))}
            </Select>
          </Stack>
        </Grid>
      </Stack>
    </Card>
  )
})

// ─── CreateWineProducts ───────────────────────────────────────────────────────

export function CreateWineProducts() {
  const { vinofactClient, constants } = useITSContext()
  const client = useClient({ apiVersion: '2024-01-01' })
  const toast = useToast()

  const [productTitle, setProductTitle] = useState('')
  const [globalPrice, setGlobalPrice] = useState('')
  const [globalTaxCategoryId, setGlobalTaxCategoryId] = useState('')
  const [rows, setRows] = useState<WineRow[]>([emptyRow()])
  const [wines, setWines] = useState<VinofactWine[]>([])
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([])
  const [loadingWines, setLoadingWines] = useState(true)
  const [loadingTax, setLoadingTax] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [queries, setQueries] = useState<Record<string, string>>({})

  // ─── Load data ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!vinofactClient) return
    vinofactClient
      .getWines()
      .then((data) => {
        const sorted = [...data.wines].sort((a, b) => {
          const cmp = a.title.localeCompare(b.title)
          return cmp !== 0 ? cmp : (Number(b.year) || 0) - (Number(a.year) || 0)
        })
        setWines(sorted)
      })
      .catch(() => {})
      .finally(() => setLoadingWines(false))
  }, [vinofactClient])

  useEffect(() => {
    client
      .fetch<TaxCategory[]>(
        `*[_type == "taxCategory"]{
          _id,
          "title": coalesce(
            title[_key == "de"][0].value,
            title[_key == "en"][0].value,
            title[0].value
          ),
          "code": code.current
        }`,
      )
      .then(setTaxCategories)
      .catch(() => {})
      .finally(() => setLoadingTax(false))
  }, [client])

  // ─── Row operations ──────────────────────────────────────────────────────────

  const addRow = useCallback(() => setRows((r) => [...r, emptyRow()]), [])

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

  // ─── Global field handlers ────────────────────────────────────────────────────

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setProductTitle(e.currentTarget.value),
    [],
  )
  const handleGlobalPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setGlobalPrice(e.currentTarget.value),
    [],
  )
  const handleGlobalTaxChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setGlobalTaxCategoryId(e.currentTarget.value),
    [],
  )

  // ─── Options per row ─────────────────────────────────────────────────────────

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
          .filter((w) => `${w.title} ${w.year}`.toLowerCase().includes(q))
          .map((w): WineOption => ({ value: w.id, payload: w }))
        return [row.id, opts]
      }),
    )
  }, [wines, selectedWineIds, queries, rows])

  // ─── Validation ──────────────────────────────────────────────────────────────

  const canSubmit = useMemo(() => {
    if (!productTitle.trim()) return false
    if (!globalPrice && rows.some((r) => !r.price)) return false
    if (rows.length === 0) return false
    if (rows.some((r) => !r.wine || !r.volume)) return false
    return true
  }, [productTitle, globalPrice, rows])

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const tx = client.transaction()
      const productId = `product-${uid()}`

      tx.create({
        _id: productId,
        _type: 'product',
        title: { _type: 'i18nString', de: productTitle },
        kind: 'wine',
        price: globalPrice ? { _type: 'price', amount: parseFloat(globalPrice) } : undefined,
        taxCategory: globalTaxCategoryId
          ? { _type: 'reference', _ref: globalTaxCategoryId }
          : undefined,
      })

      for (const row of rows) {
        if (!row.wine || !row.volume) continue
        tx.create({
          _id: `productVariant-${uid()}`,
          _type: 'productVariant',
          kind: 'wine',
          product: { _type: 'reference', _ref: productId },
          status: 'active',
          featured: false,
          wine: {
            _type: 'wine',
            vinofactWineId: row.wine.id,
            vintage: row.wine.year ?? undefined,
            volume: parseInt(row.volume),
          },
          price: (row.price || globalPrice)
            ? { _type: 'price', amount: parseFloat(row.price || globalPrice) }
            : undefined,
          taxCategory: (row.taxCategoryId || globalTaxCategoryId)
            ? { _type: 'reference', _ref: row.taxCategoryId || globalTaxCategoryId }
            : undefined,
        })
      }

      await tx.commit()

      toast.push({
        status: 'success',
        title: 'Product created',
        description: `Created "${productTitle}" with ${rows.length} variant(s)`,
      })

      setProductTitle('')
      setGlobalPrice('')
      setGlobalTaxCategoryId('')
      setRows([emptyRow()])
    } catch (err: any) {
      toast.push({ status: 'error', title: 'Failed to create product', description: err.message })
    } finally {
      setSubmitting(false)
    }
  }, [canSubmit, client, productTitle, globalPrice, globalTaxCategoryId, rows, toast])

  const volumeOptions = constants.volumeOptions ?? []

  // ─── UI ──────────────────────────────────────────────────────────────────────

  return (
    <Container width={2} padding={4}>
      <Stack space={6}>
        {/* Header */}
        <Stack space={2}>
          <Flex align="center" gap={3}>
            <Text size={4}>🍷</Text>
            <Heading size={3}>Create Wine Product</Heading>
          </Flex>
          <Text size={1} muted>
            Select wines, configure pricing, and create a product with variants in one step.
          </Text>
        </Stack>

        {/* Product */}
        <Card border radius={2} padding={4}>
          <Stack space={4}>
            <Text
              size={1}
              weight="semibold"
              style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              Product
            </Text>
            <Stack space={2}>
              <Label size={1}>Title *</Label>
              <TextInput
                value={productTitle}
                onChange={handleTitleChange}
                placeholder="e.g. Château Margaux"
              />
            </Stack>
          </Stack>
        </Card>

        {/* Global defaults */}
        <Card border radius={2} padding={4}>
          <Stack space={4}>
            <Text
              size={1}
              weight="semibold"
              style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              Global Defaults
            </Text>
            <Grid columns={2} gap={3}>
              <Stack space={2}>
                <Label size={1}>Price (default) *</Label>
                <TextInput
                  type="number"
                  value={globalPrice}
                  onChange={handleGlobalPriceChange}
                  placeholder="e.g. 24.90"
                />
              </Stack>
              <Stack space={2}>
                <Label size={1}>Tax Category (default)</Label>
                <Select
                  value={globalTaxCategoryId}
                  onChange={handleGlobalTaxChange}
                  disabled={loadingTax}
                >
                  <option value="">— none —</option>
                  {taxCategories.map((tc) => (
                    <option key={tc._id} value={tc._id}>
                      {tc.title} ({tc.code})
                    </option>
                  ))}
                </Select>
              </Stack>
            </Grid>
          </Stack>
        </Card>

        {/* Wine rows */}
        <Stack space={3}>
          <Flex align="center" justify="space-between">
            <Text
              size={1}
              weight="semibold"
              style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              Wines / Variants
            </Text>
            <Text size={1} muted>
              {rows.length} variant{rows.length !== 1 ? 's' : ''}
            </Text>
          </Flex>

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
              onUpdate={updateRow}
              onRemove={removeRow}
              onQueryChange={handleQueryChange}
            />
          ))}

          <Button mode="ghost" icon={AddIcon} text="Add wine" onClick={addRow} />
        </Stack>

        {/* Submit */}
        <Flex justify="flex-end">
          <Button
            tone="primary"
            text={
              submitting
                ? 'Creating…'
                : `Create product + ${rows.length} variant${rows.length !== 1 ? 's' : ''}`
            }
            disabled={!canSubmit || submitting}
            loading={submitting}
            onClick={handleSubmit}
          />
        </Flex>
      </Stack>
    </Container>
  )
}
