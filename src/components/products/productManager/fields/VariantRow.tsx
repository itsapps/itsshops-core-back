import { Card } from '@sanity/ui'
import { ReactElement, ReactNode } from 'react'

export function VariantRow({
  children,
  index,
  ...props
}: {
  children: ReactNode
  index: number
  [key: string]: any
}): ReactElement {
  return (
    <Card border radius={2} padding={4} shadow={index % 2} {...props}>
      {children}
    </Card>
  )
}
