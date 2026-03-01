import { Flex, Stack, Text } from '@sanity/ui'
import React from 'react'

import { VinofactWine } from '../../types'
import { WineImporterRow } from './WineImporterRow'

type WineImporterListProps = {
  wines: VinofactWine[]
  selectedIds: string[]
  onToggle: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function WineImporterList({
  wines,
  selectedIds,
  onToggle,
}: WineImporterListProps): React.ReactElement {
  if (wines.length === 0) {
    return (
      <Flex align="center" justify="center" height="fill" padding={4}>
        <Text muted>No wines found...</Text>
      </Flex>
    )
  }

  return (
    <Stack>
      {wines.map((wine) => (
        <WineImporterRow
          key={wine.id}
          wine={wine}
          isSelected={selectedIds.includes(wine.id)}
          onToggle={onToggle}
        />
      ))}
    </Stack>
  )
}
