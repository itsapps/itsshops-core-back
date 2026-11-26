import { TextInput } from '@sanity/ui'
import { ChangeEvent, ReactElement, useCallback, useId } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { usePriceInputState } from '../../../../lib/hooks/usePriceInputState'
import { PriceFieldProps } from '../ProductCreator.types'
import { LabelField } from './Label'

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── PriceInputField ──────────────────────────────────────────────────────────

export function PriceField({
  value,
  onChange,
  readOnly = false,
  disabled = false,
  required = false,
  inheritedLabel,
}: PriceFieldProps): ReactElement {
  const { schemaT, componentT } = useITSContext()
  const id = useId()
  const { displayValue, handleChange, handleFocus, handleBlur } = usePriceInputState(
    value,
    onChange,
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => handleChange(e.currentTarget.value),
    [handleChange],
  )

  return (
    <LabelField id={id} title={schemaT.default('fields.price.title')} required={required}>
      <TextInput
        id={id}
        inputMode="decimal"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        // An inherited price replaces the example ("14,90 € vom Produkt")
        placeholder={
          inheritedLabel ?? componentT.default('productCreatorTool.placeholders.productPrice')
        }
        readOnly={readOnly}
        disabled={disabled}
      />
    </LabelField>
  )
}
