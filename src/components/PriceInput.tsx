import { TextInput } from '@sanity/ui'
import React, { useCallback } from 'react'
import { NumberInputProps, set, unset } from 'sanity'

import { usePriceInputState } from '../lib/hooks/usePriceInputState'

export const PriceInput = (props: NumberInputProps): React.ReactElement => {
  const { value, onChange, elementProps } = props

  const handleChange = useCallback(
    (cents: number | undefined) => {
      if (typeof cents === 'number') {
        onChange(set(cents))
      } else {
        onChange(unset())
      }
    },
    [onChange],
  )

  const {
    displayValue,
    decimalSep,
    handleChange: handleRawChange,
    handleFocus,
    handleBlur,
  } = usePriceInputState(value, handleChange)

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => handleRawChange(e.currentTarget.value),
    [handleRawChange],
  )

  return (
    <TextInput
      {...elementProps}
      inputMode="decimal"
      value={displayValue}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={`0${decimalSep}00`}
    />
  )
}
