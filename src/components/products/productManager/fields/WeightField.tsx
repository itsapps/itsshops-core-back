import { TextInput } from '@sanity/ui'
import { ChangeEvent, ReactElement, useCallback } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { WeightFieldProps } from '../ProductCreator.types'
import { LabelField } from './Label'

export function WeightField({ value, onChange, required = false }: WeightFieldProps): ReactElement {
  const { schemaT } = useITSContext()

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.currentTarget.value
      if (raw === '') {
        onChange(undefined)
      } else {
        const parsed = parseInt(raw, 10)
        if (!isNaN(parsed) && parsed > 0) onChange(parsed)
      }
    },
    [onChange],
  )

  return (
    <LabelField title={schemaT.default('fields.weight.title', 'Weight (g)')} required={required}>
      <TextInput
        inputMode="numeric"
        value={value ?? ''}
        onChange={handleChange}
        placeholder="z.B. 500"
      />
    </LabelField>
  )
}