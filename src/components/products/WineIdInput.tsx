import {
  Autocomplete,
  Box,
  Button,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  Stack,
  Text,
  useToast,
} from '@sanity/ui'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { type StringInputProps, PatchEvent, set, unset } from 'sanity'

import {
  EllipsisHorizontalIcon,
  LaunchIcon,
  SyncIcon,
  TrashIcon,
  WarningOutlineIcon,
} from '../../assets/icons'
import { useITSContext } from '../../context/ITSCoreProvider'
import { VinofactWine } from '../../types'
import { WinePreview } from './WinePreview'
import { winesCache } from './WineObjectInput'

interface WineOption {
  value: string
  payload: VinofactWine
}

/**
 * Custom input for the `vinofactWineId` STRING field only.
 * Patches ONLY its own string value. Sibling `vintage` patch is handled
 * by the parent WineObjectInput wrapper.
 *
 * Schema:
 *   defineField({ name: 'vinofactWineId', type: 'string', components: { input: WineIdInput } })
 */
export function WineIdInput(props: StringInputProps): ReactElement {
  const { value, onChange, readOnly, elementProps } = props

  const { vinofactClient } = useITSContext()
  const toast = useToast()

  const [wines, setWines] = useState<VinofactWine[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isReplacing, setIsReplacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadWines = useCallback(async () => {
    if (!vinofactClient) {
      toast.push({
        status: 'error',
        title: 'Vinofact client not initialized.',
        description: 'Check your shop configuration features.',
      })
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await vinofactClient.getWines()
      const sorted = [...data.wines].sort((a, b) => {
        const titleComp = a.title.localeCompare(b.title)
        return titleComp === 0 ? (Number(b.year) || 0) - (Number(a.year) || 0) : titleComp
      })
      setWines(sorted)
      sorted.forEach((w) => winesCache.set(w.id, w))
    } catch (err: any) {
      toast.push({ status: 'error', title: 'Fetch Failed', description: err.message })
      setError(err.message || 'Failed to fetch wines from Vinofact.')
    } finally {
      setLoading(false)
    }
  }, [vinofactClient, toast])

  useEffect(() => {
    loadWines()
  }, [loadWines])

  const options = useMemo((): WineOption[] => {
    const q = query.toLowerCase()
    return wines
      .filter((w) => `${w.title} ${w.year}`.toLowerCase().includes(q))
      .map((w) => ({ value: w.id, payload: w }))
  }, [wines, query])

  const selectedWine = useMemo(() => wines.find((w) => w.id === value), [wines, value])

  // Only patch own string value — no sibling patches
  const handleSelect = useCallback(
    (id: string) => {
      onChange(id ? PatchEvent.from(set(id)) : PatchEvent.from(unset()))
      setIsReplacing(false)
    },
    [onChange],
  )

  const handleClear = useCallback(() => {
    onChange(PatchEvent.from(unset()))
    setIsReplacing(false)
  }, [onChange])

  const openEditUrl = useCallback(
    () => selectedWine?.editUrl && window.open(selectedWine.editUrl, '_blank'),
    [selectedWine],
  )

  const renderOption = useCallback(
    (option: WineOption) => (
      <Card padding={3} radius={0} borderBottom>
        <WinePreview wine={option.payload} />
      </Card>
    ),
    [],
  )

  const renderValue = useCallback(
    (val: string, option?: WineOption): string => option?.payload.title ?? val,
    [],
  )

  if (error) {
    return (
      <Card padding={3} radius={2} tone="caution" border>
        <Flex align="center" gap={3}>
          <Text size={2}>
            <WarningOutlineIcon />
          </Text>
          <Stack space={2}>
            <Text size={1} weight="semibold">Vinofact Configuration Issue</Text>
            <Text size={1} muted>{error}</Text>
          </Stack>
        </Flex>
      </Card>
    )
  }

  if (selectedWine && !isReplacing) {
    return (
      <Card border radius={2} padding={1}>
        <Flex align="center">
          <Box flex={1} onClick={openEditUrl} style={{ cursor: 'pointer' }}>
            <Card padding={2} radius={1}>
              <WinePreview wine={selectedWine} />
            </Card>
          </Box>
          <MenuButton
            button={<Button mode="bleed" icon={EllipsisHorizontalIcon} />}
            id={`${elementProps.id}-menu`}
            menu={
              <Menu>
                <MenuItem text="Clear" icon={TrashIcon} tone="critical" onClick={handleClear} />
                <MenuItem text="Replace" icon={SyncIcon} onClick={() => setIsReplacing(true)} />
                <MenuDivider />
                <MenuItem text="Open in new tab" icon={LaunchIcon} onClick={openEditUrl} />
              </Menu>
            }
          />
        </Flex>
      </Card>
    )
  }

  return (
    <Autocomplete
      id={elementProps.id}
      loading={loading}
      openButton
      options={options}
      placeholder="Search wines…"
      onSelect={handleSelect}
      onQueryChange={(q) => setQuery(q ?? '')}
      renderOption={renderOption}
      renderValue={renderValue}
      readOnly={readOnly}
    />
  )
}
