import { TextInput } from '@sanity/ui'
import { ChangeEvent, ReactElement, useCallback } from 'react'

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
}: PriceFieldProps): ReactElement {
  const { schemaT, componentT } = useITSContext()
  const { displayValue, handleChange, handleFocus, handleBlur } = usePriceInputState(
    value,
    onChange,
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => handleChange(e.currentTarget.value),
    [handleChange],
  )

  return (
    <LabelField title={schemaT.default('fields.price.title')} required={required}>
      <TextInput
        inputMode="decimal"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={componentT.default('productCreatorTool.placeholders.productPrice')}
        readOnly={readOnly}
        disabled={disabled}
      />
    </LabelField>
  )
}
