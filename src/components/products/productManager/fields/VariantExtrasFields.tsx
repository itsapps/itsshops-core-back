import { Grid, Select, Stack, Text, TextInput } from '@sanity/ui'
import { ChangeEvent, ReactElement, useCallback, useId } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import type { ITSTranslator } from '../../../../types/localization'
import { parseStock } from '../../../../utils/productManager'
import { NewVariantStatus, VariantExtras } from '../ProductCreator.types'
import { LabelField } from './Label'

export const NEW_VARIANT_STATUSES: NewVariantStatus[] = ['active', 'comingSoon']

export function emptyExtras(): VariantExtras {
  return { status: 'active', sku: '', stock: '' }
}

/** How many extras differ from the default — added to the "Advanced (n)" count. */
export function extrasSetCount(extras: Partial<VariantExtras>): number {
  return (
    (extras.status && extras.status !== 'active' ? 1 : 0) +
    (extras.sku?.trim() ? 1 : 0) +
    (extras.stock?.trim() ? 1 : 0)
  )
}

/** Submit reason for a stock that isn't empty or a whole number ≥ 0 (no schema validation runs). */
export function stockReason(
  componentT: ITSTranslator,
  label: string,
  stock: string | undefined,
): string | undefined {
  if (stock === undefined || parseStock(stock).valid) return undefined
  return componentT.default('productCreatorTool.reasons.stockInvalid', undefined, { label })
}

interface VariantExtrasFieldsProps {
  extras: Partial<VariantExtras>
  /** Stock field (only with `shop.stock`, never for bundles). */
  showStock: boolean
  onChange: (key: keyof VariantExtras, value: string) => void
}

/** Status (active / coming soon), SKU and stock of one new variant. */
export function VariantExtrasFields(props: VariantExtrasFieldsProps): ReactElement {
  const { extras, showStock, onChange } = props
  const { schemaT, componentT } = useITSContext()
  const statusId = useId()
  const skuId = useId()
  const stockId = useId()
  const stockHintId = useId()

  const handleStatus = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => onChange('status', e.currentTarget.value),
    [onChange],
  )
  const handleSku = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange('sku', e.currentTarget.value),
    [onChange],
  )
  const handleStock = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange('stock', e.currentTarget.value),
    [onChange],
  )
  const stockInvalid = showStock && !parseStock(extras.stock ?? '').valid

  return (
    <Grid gridTemplateColumns={[1, 1, showStock ? 3 : 2]} gap={3}>
      <LabelField id={statusId} title={schemaT.default('productVariant.fields.status.title')}>
        <Select id={statusId} value={extras.status ?? 'active'} onChange={handleStatus}>
          {NEW_VARIANT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {schemaT.default(`productVariant.fields.status.options.${status}`)}
            </option>
          ))}
        </Select>
      </LabelField>
      <LabelField id={skuId} title={schemaT.default('fields.sku.title')}>
        <TextInput id={skuId} value={extras.sku ?? ''} onChange={handleSku} />
      </LabelField>
      {showStock && (
        <LabelField id={stockId} title={schemaT.default('fields.stock.title')}>
          <Stack gap={2}>
            <TextInput
              id={stockId}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={extras.stock ?? ''}
              onChange={handleStock}
              aria-describedby={stockHintId}
              aria-invalid={stockInvalid || undefined}
              customValidity={
                stockInvalid ? componentT.default('productCreatorTool.extras.stockInvalid') : ''
              }
            />
            <Text id={stockHintId} size={1} muted>
              {componentT.default('productCreatorTool.extras.stockHint')}
            </Text>
          </Stack>
        </LabelField>
      )}
    </Grid>
  )
}
