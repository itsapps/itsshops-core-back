import { TextInput } from '@sanity/ui'
import React, { useCallback, useMemo, useState } from 'react'
import { NumberInputProps, set, unset } from 'sanity'

import { useITSContext } from '../context/ITSCoreProvider'

function getSeparators(locale: string) {
  const parts = Intl.NumberFormat(locale).formatToParts(1234.5)
  const decimal = parts.find((p) => p.type === 'decimal')?.value || '.'
  const group = parts.find((p) => p.type === 'group')?.value || ','
  return { decimal, group }
}

export const PriceInput = (props: NumberInputProps): React.ReactElement => {
  const { value, onChange, elementProps } = props
  const { format, locale } = useITSContext()

  // 1. Memoize separators so they don't re-calculate every render
  const { decimal: decimalSep, group: groupSep } = useMemo(() => getSeparators(locale), [locale])

  // Internal state ONLY for when the user is actively typing
  const [editValue, setEditValue] = useState<string>('')
  const [focused, setFocused] = useState(false)

  // 2. DERIVED VALUE: Calculate what to show in the input
  // If focused, show what they typed. If not, show the pretty currency from Sanity.
  const displayValue = useMemo(() => {
    if (focused) return editValue
    return typeof value === 'number' ? format.currency(value / 100) : ''
  }, [focused, editValue, value, format])

  // Helper: parse input string to cents
  const parseRawToCents = useCallback(
    (raw: string): number | undefined => {
      let normalized = raw.split(groupSep).join('')
      if (decimalSep !== '.') normalized = normalized.replace(decimalSep, '.')
      if (!normalized.match(/\d/)) return undefined
      const float = parseFloat(normalized)
      return isNaN(float) ? undefined : Math.round(float * 100)
    },
    [decimalSep, groupSep],
  )

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.currentTarget.value
      setEditValue(raw)

      const cents = parseRawToCents(raw)
      if (typeof cents === 'number' && raw.trim() !== '') {
        onChange(set(cents))
      } else if (raw.trim() === '') {
        onChange(unset())
      }
    },
    [onChange, parseRawToCents],
  )

  const handleFocus = useCallback(() => {
    setFocused(true)
    // When focusing, prepopulate the edit field with a "clean" number for editing
    // instead of the currency symbol and formatted groups
    setEditValue(typeof value === 'number' ? (value / 100).toString().replace('.', decimalSep) : '')
  }, [value, decimalSep])

  const handleBlur = useCallback(() => {
    setFocused(false)
    setEditValue('') // Clear the scratchpad on blur
  }, [])

  return (
    <TextInput
      {...elementProps}
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={`0${decimalSep}00`}
    />
  )
}
