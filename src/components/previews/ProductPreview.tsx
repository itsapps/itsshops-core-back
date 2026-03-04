import { PackageIcon, StackIcon, TagIcon } from '@sanity/icons'
import { Badge, Box, Flex, Stack, Text } from '@sanity/ui'
import React from 'react'

import { useITSContext } from '../../context/ITSCoreProvider'

export function ProductPreview(props: any): React.ReactElement {
  const { title, price, variantCount, media } = props
  const { localizer } = useITSContext()

  return (
    <Flex align="center" padding={2} gap={3}>
      {/* Media / Icon Area */}
      <Box style={{ width: 40, height: 40, flexShrink: 0 }}>
        {media ? (
          <img
            src={media}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <Flex
            align="center"
            justify="center"
            style={{ height: '100%', background: '#f2f3f5', borderRadius: 4 }}
          >
            <Text size={2}>
              <PackageIcon />
            </Text>
          </Flex>
        )}
      </Box>

      {/* Text Information */}
      <Stack space={2} flex={1}>
        <Flex align="center" gap={2}>
          <Text weight="semibold" size={1}>
            {localizer.value(title) || 'Untitled'}
          </Text>
          {/* <Badge tone={'positive'} fontSize={0}>
            {config.label}
          </Badge> */}
        </Flex>

        <Flex gap={3} align="center">
          {price && (
            <Text size={1} muted weight="bold" style={{ color: '#2a7e39' }}>
              €{price.toFixed(2)}
            </Text>
          )}
          {variantCount > 0 && (
            <Text size={0} muted>
              • {variantCount} variants
            </Text>
          )}
        </Flex>
      </Stack>
    </Flex>
  )
}
