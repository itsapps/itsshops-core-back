import { Label, Stack } from '@sanity/ui'
import { ReactElement } from 'react'

import { LabelFieldProps } from '../ProductCreator.types'

export function LabelField(props: LabelFieldProps): ReactElement {
  const { title, required = false, children } = props
  return (
    <Stack space={2}>
      <Label size={1}>{`${title}${required ? ' *' : ''}`}</Label>
      {children}
    </Stack>
  )
}
