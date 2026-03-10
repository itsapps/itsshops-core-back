import { Label, Stack, TextInput } from '@sanity/ui'
import { ChangeEvent, ReactElement } from 'react'
import { useCallback } from 'react'

import { useITSContext } from '../../../context/ITSCoreProvider'
import { PriceFieldProps } from './ProductCreator.types'

export function PriceField(props: PriceFieldProps): ReactElement {
  const { value, onChange, required } = props
  const { schemaT, componentT } = useITSContext()
  const handlePriceChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(e.currentTarget.value),
    [onChange],
  )

  return (
    <Stack space={2}>
      <Label size={1}>{`${schemaT.default('fields.price.title')}${required ? ' *' : ''}`}</Label>
      <TextInput
        type="number"
        value={value}
        onChange={handlePriceChange}
        placeholder={componentT.default('productCreatorTool.placeholders.productPrice')}
      />
    </Stack>
  )
}
