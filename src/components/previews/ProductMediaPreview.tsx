import React from 'react';
import {Flex, Avatar} from '@sanity/ui'

export function ProductMediaPreview({ info }: { info: string }) {
  return (
    <Flex align="center" gap={2} paddingY={2}>
      <Avatar
        size={2}
        initials={`${info}`}
      />
      {/* <Stack space={2} flex={1}>
        <Text size={1} textOverflow="ellipsis">{`${localizedValue(product.title, locale) || 'Untitled'}`}</Text>
        {product.sku && <Text size={1} weight='bold'>{`[${product.sku}]`}</Text>}
      </Stack> */}
    </Flex>
  )
}
