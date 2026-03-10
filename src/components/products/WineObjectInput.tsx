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
import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type ObjectInputProps, PatchEvent, set, unset } from 'sanity'

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

interface WineOption {
  value: string
  payload: VinofactWine
}

/**
 * Register on the wine object type:
 *   components: { input: WineObjectInput }
 *
 * No changes needed to your field definitions.
 *
 * - Renders a custom picker for vinofactWineId
 * - On select, patches vinofactWineId + vintage together (valid at object scope)
 * - Passes all members to renderDefault untouched so Sanity tracks validation
 *   for group tab badges
 * - Suppresses the default vinofactWineId text input via renderField override
 */
export function WineObjectInput(props: ObjectInputProps): ReactElement {
  const { value, onChange, readOnly, renderDefault, renderField, members } = props

  const { vinofactClient } = useITSContext()
  const toast = useToast()

  const winesRef = useRef<VinofactWine[]>([])
  const [wines, setWines] = useState<VinofactWine[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isReplacing, setIsReplacing] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const loadWines = useCallback(async () => {
    if (!vinofactClient) {
      toast.push({
        status: 'error',
        title: 'Vinofact client not initialized.',
        description: 'Check your shop configuration features.',
      })
      return
    }
    setFetchError(null)
    setLoading(true)
    try {
      const data = await vinofactClient.getWines()
      const sorted = [...data.wines].sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return cmp !== 0 ? cmp : (Number(b.year) || 0) - (Number(a.year) || 0)
      })
      winesRef.current = sorted
      setWines(sorted)
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch wines from Vinofact.'
      toast.push({ status: 'error', title: 'Fetch Failed', description: msg })
      setFetchError(msg)
    } finally {
      setLoading(false)
    }
  }, [vinofactClient, toast])

  useEffect(() => {
    loadWines()
  }, [loadWines])

  const currentWineId = (value as any)?.vinofactWineId as string | undefined

  const options = useMemo((): WineOption[] => {
    const q = (query ?? '').toLowerCase()
    return wines
      .filter((w) => `${w.title} ${w.year}`.toLowerCase().includes(q))
      .map((w) => ({ value: w.id, payload: w }))
  }, [wines, query])

  const selectedWine = useMemo(
    () => wines.find((w) => w.id === currentWineId),
    [wines, currentWineId],
  )

  // Pull validation state from the vinofactWineId member for picker tone
  const wineIdMember = members.find((m) => m.kind === 'field' && m.name === 'vinofactWineId')
  const fieldValidation = wineIdMember?.kind === 'field' ? wineIdMember.field.validation : []
  const hasError = fieldValidation.some((m) => m.level === 'error')
  const hasWarning = fieldValidation.some((m) => m.level === 'warning')
  const pickerTone = hasError ? 'critical' : hasWarning ? 'caution' : 'default'

  const handleSelect = useCallback(
    (id: string) => {
      const wine = winesRef.current.find((w) => w.id === id)
      if (wine) {
        onChange(
          PatchEvent.from([
            set(wine.id, ['vinofactWineId']),
            wine.year ? set(wine.year, ['vintage']) : unset(['vintage']),
          ]),
        )
      } else {
        onChange(PatchEvent.from([unset(['vinofactWineId']), unset(['vintage'])]))
      }
      setIsReplacing(false)
    },
    [onChange],
  )

  const handleClear = useCallback(() => {
    onChange(PatchEvent.from([unset(['vinofactWineId']), unset(['vintage'])]))
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

  // Override renderField to skip rendering vinofactWineId — our picker replaces it.
  // All members are still passed to renderDefault so Sanity counts validation
  // errors correctly for group tab badges.
  const renderFieldOverride = useCallback(
    (fieldProps: any) => {
      if (fieldProps.name === 'vinofactWineId') return null
      return renderField(fieldProps)
    },
    [renderField],
  )

  const picker = fetchError ? (
    <Card padding={3} radius={2} tone="caution" border>
      <Flex align="center" gap={3}>
        <Text size={2}>
          <WarningOutlineIcon />
        </Text>
        <Stack space={2}>
          <Text size={1} weight="semibold">
            Vinofact Configuration Issue
          </Text>
          <Text size={1} muted>{fetchError}</Text>
        </Stack>
      </Flex>
    </Card>
  ) : selectedWine && !isReplacing ? (
    <Card border radius={2} padding={1} tone={pickerTone}>
      <Flex align="center">
        <Box flex={1} onClick={openEditUrl} style={{ cursor: 'pointer' }}>
          <Card padding={2} radius={1}>
            <WinePreview wine={selectedWine} />
          </Card>
        </Box>
        <MenuButton
          button={<Button mode="bleed" icon={EllipsisHorizontalIcon} />}
          id="wine-selector-menu"
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
  ) : (
    <Autocomplete
      id="wine-autocomplete"
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

  return (
    <Stack space={3}>
      {/* Our custom picker for vinofactWineId */}
      {wineIdMember && (
        <Stack space={2}>
          <Text size={1} weight="semibold">
            {wineIdMember.kind === 'field' ? wineIdMember.field.schemaType.title : 'Wine'}
          </Text>
          {picker}
          {fieldValidation.map((marker, i) => (
            <Text
              key={i}
              size={1}
              muted
              style={{ color: marker.level === 'error' ? 'var(--card-critical-fg-color)' : 'var(--card-caution-fg-color)' }}
            >
              {String(marker.message)}
            </Text>
          ))}
        </Stack>
      )}

      {/* renderDefault renders volume, vintage etc. with full Sanity scaffolding.
          All members passed in so validation badge counts are correct.
          renderFieldOverride suppresses the duplicate vinofactWineId input. */}
      {renderDefault({ ...props, renderField: renderFieldOverride })}
    </Stack>
  )
}
