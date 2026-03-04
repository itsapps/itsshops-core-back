import { Autocomplete, Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import { useCallback, useMemo, useState } from 'react'

import { CloseIcon, SearchIcon } from '../../assets/icons'
import { VinofactWine } from '../../types'
import { WinePreview } from './WinePreview'

export function WineMultiselect({ wines }: { wines: VinofactWine[] }) {
  const [selectedWines, setSelectedWines] = useState<VinofactWine[]>([])

  // Filter out wines that are already selected from the dropdown options
  const wineOptions = useMemo(
    () =>
      wines
        .filter((wine) => !selectedWines.find((s) => s.id === wine.id))
        .map((wine) => ({ value: wine.id, payload: wine })),
    [wines, selectedWines],
  )

  const handleSelect = useCallback(
    async (value: string) => {
      const wine = wines.find((w) => w.id === value)
      if (wine) {
        setSelectedWines((prev) => [...prev, wine])
      }
    },
    [wines, setSelectedWines],
  )
  const handleRemove = useCallback((id: string) => {
    setSelectedWines((prev) => prev.filter((w) => w.id !== id))
  }, [])

  return (
    <Stack space={3}>
      {/* 1. The Search Input */}
      <Autocomplete
        id="wine-search"
        icon={SearchIcon}
        options={wineOptions}
        onSelect={handleSelect}
        placeholder="Search and add wines..."
        openButton
        renderOption={(option) => (
          <Card as="button" padding={3} radius={0} borderBottom>
            <WinePreview wine={option.payload} />
          </Card>
        )}
        // Reset the input value after selection
        // renderValue={() => ''}
      />

      {/* 2. The Selected Items (The "Tags") */}
      <Stack>
        {selectedWines.map((wine) => (
          // <Card key={wine.id}  as="button" padding={3} radius={0} borderBottom>
          //   <WinePreview wine={wine} />
          // </Card>
          <Card key={wine.id} padding={1} radius={2} shadow={1} tone="transparent" border>
            <Flex justify={'space-between'} align="center" gap={2}>
              <WinePreview wine={wine} />
              <Button
                icon={CloseIcon}
                mode="bleed"
                padding={1}
                onClick={() => handleRemove(wine.id)}
                fontSize={1}
              />
            </Flex>
          </Card>
        ))}
      </Stack>
      {/* <Flex wrap="wrap" gap={2}>
        {selectedWines.map((wine) => (
          <Card key={wine.id} padding={1} radius={2} shadow={1} tone="transparent" border>
            <Flex align="center" gap={2}>
              <Box paddingLeft={2}>
                <Text size={1} weight="semibold">
                  {wine.title}
                </Text>
              </Box>
              <Button
                icon={CloseIcon}
                mode="bleed"
                padding={1}
                onClick={() => handleRemove(wine.id)}
                fontSize={1}
              />
            </Flex>
          </Card>
        ))}
      </Flex> */}

      {/* 3. Action Button */}
      {selectedWines.length > 0 && (
        <Button
          text={`Import ${selectedWines.length} Wines`}
          tone="primary"
          fontSize={2}
          onClick={() => console.log('Importing...', selectedWines)}
        />
      )}
    </Stack>
  )
}