import { Box, Card, Checkbox, Flex } from '@sanity/ui'
import React, { memo } from 'react'

import { VinofactWine } from '../../types'
import { WinePreview } from './WinePreview'

type WineRowProps = {
  wine: VinofactWine
  isSelected: boolean
  onToggle: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const WineImporterRow = memo(({ wine, isSelected, onToggle }: WineRowProps) => {
  return (
    <Card padding={3} borderBottom tone={isSelected ? 'positive' : 'default'}>
      <Flex align="center" gap={3}>
        <Checkbox value={wine.id} checked={isSelected} onChange={onToggle} />
        <Box flex={1}>
          <WinePreview wine={wine} />
        </Box>
      </Flex>
    </Card>
  )
})

WineImporterRow.displayName = 'WineImporterRow'
