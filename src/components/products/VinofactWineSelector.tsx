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
import { type StringInputProps, unset, useFormValue, useTranslation } from 'sanity'

import {
  EllipsisHorizontalIcon,
  LaunchIcon,
  SyncIcon,
  TrashIcon,
  WarningOutlineIcon,
} from '../../assets/icons'
// import { WineIcon } from '../assets/icons'
import { useITSContext } from '../../context/ITSCoreProvider'
import { VinofactWine } from '../../types'
import { WinePreview } from './WinePreview'

interface WineOption {
  value: string
  payload: VinofactWine
}

export function VinofactWineSelector(props: StringInputProps): ReactElement {
  const { value, onChange, readOnly, elementProps } = props
  const { onChange: _ignoredOnChange, ...restElementProps } = elementProps
  const variantId = useFormValue(['_id']) as string | undefined
  const { vinofactClient, sanityClient } = useITSContext()
  const { t } = useTranslation('studio')
  const toast = useToast()

  const [wines, setWines] = useState<VinofactWine[]>([])
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
    } catch (err: any) {
      toast.push({
        status: 'error',
        title: 'Fetch Failed',
        description: err.message,
      })
      setError(err.message || 'Failed to fetch wines from Vinofact.')
    } finally {
      setLoading(false)
    }
  }, [vinofactClient, toast])

  useEffect(() => {
    loadWines()
  }, [loadWines])

  const options = useMemo(
    (): WineOption[] =>
      wines.map((w) => ({
        value: w.id,
        payload: w,
      })),
    [wines],
  )

  const selectedWine = useMemo(() => wines.find((w) => w.id === value), [wines, value])

  const handleSelect = useCallback(
    (id: string) => {
      const selection = wines.find((w) => w.id === id)
      if (selection) {
        // onChange(
        //   PatchEvent.from([
        //     set(selection.id),
        //     set(selection.year, ['vintage']), // Updates sibling 'vintage' field
        //   ]),
        // )
        // onChange(PatchEvent.from(set(selection.id)))
        // onChange(PatchEvent.from(set(selection.year, ['vintage'])))
        if (variantId) {
          sanityClient
            .patch(variantId)
            .set({ vintage: selection.year, vinofactWineId: selection.id })
            .commit()
        }
      } else {
        onChange(unset())
      }
      setIsReplacing(false)
    },
    [onChange, wines, sanityClient, variantId],
  )
  const handleClearSelection = useCallback(() => {
    onChange(unset())
    setIsReplacing(false)
  }, [onChange])

  const openEditUrl = useCallback(
    () => selectedWine?.editUrl && window.open(selectedWine.editUrl, '_blank'),
    [selectedWine],
  )
  const handleIsReplacing = useCallback(() => setIsReplacing(true), [])

  const filterOption = useCallback((query: string, option: WineOption) => {
    const { title, year } = option.payload
    return `${title} ${year}`.toLowerCase().includes(query.toLowerCase())
  }, [])

  const renderOption = useCallback(
    (option: WineOption) => (
      <Card as="button" padding={3} radius={0} borderBottom>
        <WinePreview wine={option.payload} />
      </Card>
    ),
    [],
  )
  const renderValue = useCallback((val: string, option?: WineOption) => {
    return option?.payload.title || val
  }, [])

  if (error) {
    return (
      <Card padding={3} radius={2} tone="caution" border>
        <Flex align="center" gap={3}>
          <Text size={2}>
            <WarningOutlineIcon />
          </Text>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Vinofact Configuration Issue
            </Text>
            <Text size={1} muted>
              {error}
            </Text>
          </Stack>
        </Flex>
      </Card>
    )
  }

  // --- UI SWITCH ---
  // If we have a selection and aren't in "Replace" mode, show the Chip
  if (selectedWine && !isReplacing) {
    return (
      <Card border radius={2} padding={1}>
        <Flex align="center">
          <Box flex={1} onClick={openEditUrl} style={{ cursor: 'pointer' }}>
            <Card padding={2} radius={1} tone="default">
              <WinePreview wine={selectedWine} />
            </Card>
          </Box>
          <MenuButton
            button={<Button mode="bleed" icon={EllipsisHorizontalIcon} />}
            id="wine-menu"
            menu={
              <Menu>
                <MenuItem
                  text={t('inputs.reference.action.clear')}
                  icon={TrashIcon}
                  tone="critical"
                  onClick={handleClearSelection}
                />
                <MenuItem
                  text={t('inputs.reference.action.replace')}
                  icon={SyncIcon}
                  onClick={handleIsReplacing}
                />
                <MenuDivider />
                <MenuItem
                  text={t('inputs.reference.action.open-in-new-tab')}
                  icon={LaunchIcon}
                  onClick={openEditUrl}
                />
              </Menu>
            }
          />
        </Flex>
      </Card>
    )
  }

  return (
    <Autocomplete
      // id="wine-autocomplete"
      loading={loading}
      // icon={SearchIcon}
      {...restElementProps}
      openButton
      options={options}
      placeholder={t('inputs.reference.search-placeholder')}
      onSelect={handleSelect}
      // Custom Filter (Searches Title + Year)
      filterOption={filterOption}
      renderOption={renderOption}
      // What to display in the text field when an item is chosen
      renderValue={renderValue}
      readOnly={readOnly}
    />
  )
}
