import { useCallback, useMemo, useState } from 'react'

import { useITSContext } from '../../context/ITSCoreProvider'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getSeparators(locale: string): { decimal: string; group: string } {
  const parts = Intl.NumberFormat(locale).formatToParts(1234.5)
  const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.'
  const group = parts.find((p) => p.type === 'group')?.value ?? ','
  return { decimal, group }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UsePriceInputStateReturn {
  displayValue: string
  decimalSep: string
  handleChange: (raw: string) => void
  handleFocus: () => void
  handleBlur: () => void
}

export function usePriceInputState(
  value: number | undefined,
  onChange: (cents: number | undefined) => void,
): UsePriceInputStateReturn {
  const { locale, format } = useITSContext()

  const { decimal: decimalSep, group: groupSep } = useMemo(() => getSeparators(locale), [locale])

  const [editValue, setEditValue] = useState('')
  const [focused, setFocused] = useState(false)

  const displayValue = useMemo(() => {
    if (focused) return editValue
    return typeof value === 'number' ? format.currency(value / 100) : ''
  }, [focused, editValue, value, format])

  const parseRawToCents = useCallback(
    (raw: string): number | undefined => {
      let normalized = raw.split(groupSep).join('')
      if (decimalSep !== '.') normalized = normalized.replace(decimalSep, '.')
      if (!normalized.match(/\d/)) return undefined
      const float = parseFloat(normalized)
      if (isNaN(float) || float < 0) return undefined
      return Math.round(float * 100)
    },
    [decimalSep, groupSep],
  )

  const handleChange = useCallback(
    (raw: string) => {
      setEditValue(raw)
      const cents = parseRawToCents(raw)
      if (typeof cents === 'number' && raw.trim() !== '') {
        onChange(cents)
      } else if (raw.trim() === '') {
        onChange(undefined)
      }
    },
    [onChange, parseRawToCents],
  )

  const handleFocus = useCallback(() => {
    setFocused(true)
    setEditValue(typeof value === 'number' ? (value / 100).toFixed(2).replace('.', decimalSep) : '')
  }, [value, decimalSep])

  const handleBlur = useCallback(() => {
    setFocused(false)
    setEditValue('')
  }, [])

  return { displayValue, decimalSep, handleChange, handleFocus, handleBlur }
}
