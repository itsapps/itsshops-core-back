import { Heading, Stack, Text } from '@sanity/ui'
import { ReactElement, ReactNode } from 'react'

/** A real heading (`h2`/`h3`) for a section of the tool, with an optional muted description. */
export function SectionHeading(props: {
  as?: 'h2' | 'h3'
  title: ReactNode
  description?: ReactNode
  /** Right-aligned extra (e.g. a count). */
  aside?: ReactNode
}): ReactElement {
  const { as = 'h2', title, description, aside } = props
  return (
    <Stack gap={3}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
        <Heading as={as} size={as === 'h2' ? 1 : 0}>
          {title}
        </Heading>
        {aside}
      </div>
      {description && (
        <Text size={1} muted>
          {description}
        </Text>
      )}
    </Stack>
  )
}
