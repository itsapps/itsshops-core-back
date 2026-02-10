import { ITSi18nArray } from '../../types'
import { useITSContext } from '../../context/ITSCoreProvider'
import { Badge, Flex, Box, Text, Stack } from '@sanity/ui'
import { PackageIcon, TagIcon, StackIcon } from '@sanity/icons'
import { ProductType } from '../../types'

export function ProductPreview(props: any) {
  const { title, productType, price, variantCount, media } = props
  const { localizer, config: { apiVersion } } = useITSContext();

  // Map icons and colors to your Enum
  const typeConfigs = {
    [ProductType.Product]: { icon: PackageIcon, tone: 'primary', label: 'Product' },
    [ProductType.Variant]: { icon: TagIcon, tone: 'default', label: 'Variant' },
    [ProductType.Bundle]: { icon: StackIcon, tone: 'caution', label: 'Bundle' },
  }

  const config = typeConfigs[productType as ProductType] || { icon: PackageIcon, tone: 'default', label: 'Unknown' }

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
          <Flex align="center" justify="center" style={{ height: '100%', background: '#f2f3f5', borderRadius: 4 }}>
            <Text size={2}><config.icon /></Text>
          </Flex>
        )}
      </Box>

      {/* Text Information */}
      <Stack space={2} flex={1}>
        <Flex align="center" gap={2}>
          <Text weight="semibold" size={1}>{localizer.value(title) || 'Untitled'}</Text>
          <Badge tone={config.tone as any} fontSize={0}>
            {config.label}
          </Badge>
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