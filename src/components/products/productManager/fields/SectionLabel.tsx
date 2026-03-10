import { Text } from '@sanity/ui'
import { ReactElement, ReactNode } from 'react'

export function SectionLabel({ children }: { children: ReactNode }): ReactElement {
  return (
    <Text
      size={1}
      weight="semibold"
      // style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
    >
      {children}
    </Text>
  )
}