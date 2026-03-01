import { WineIcon } from '@phosphor-icons/react'
import { Badge, Flex, Inline, Stack, Text } from '@sanity/ui'
import { ReactElement } from 'react'

import { VinofactWine } from '../../types'

export const WinePreview = ({ wine }: { wine: VinofactWine }): ReactElement => (
  <Flex align="center" gap={3}>
    <Text size={2} muted>
      <WineIcon />
    </Text>
    <Stack space={2} flex={1}>
      <Text weight="semibold" size={1}>
        {wine.title}
      </Text>
      <Inline space={2}>
        <Badge>
          <Flex align="center" gap={1}>
            {wine.year || 'N/V'}
          </Flex>
        </Badge>
        <Text size={1} muted>
          /{wine.slug}
        </Text>
      </Inline>
    </Stack>
  </Flex>
)