import { Label, Stack } from '@sanity/ui'
import { ReactElement } from 'react'

import { LabelFieldProps } from '../ProductCreator.types'

/** A real `<label for>` above its control: pass the same `id` to the input/select. */
export function LabelField(props: LabelFieldProps): ReactElement {
  const { id, title, required = false, children } = props
  return (
    <Stack gap={2}>
      <Label as="label" htmlFor={id} size={1}>{`${title}${required ? ' *' : ''}`}</Label>
      {children}
    </Stack>
  )
}
