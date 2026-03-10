import { TextInput } from '@sanity/ui'
import { ChangeEvent, ReactElement } from 'react'
import { useCallback } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { PriceFieldProps } from '../ProductCreator.types'
import { LabelField } from './Label'

export function PriceField(props: PriceFieldProps): ReactElement {
  const { value, onChange, required = false } = props
  const { schemaT, componentT } = useITSContext()
  const handlePriceChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(e.currentTarget.value),
    [onChange],
  )

  return (
    <LabelField title={schemaT.default('fields.price.title')} required={required}>
      <TextInput
        type="number"
        value={value}
        onChange={handlePriceChange}
        placeholder={componentT.default('productCreatorTool.placeholders.productPrice')}
      />
    </LabelField>
  )
}
