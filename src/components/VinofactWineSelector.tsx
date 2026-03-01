import { WineIcon } from '@phosphor-icons/react'
import {
  EllipsisHorizontalIcon,
  LaunchIcon,
  SyncIcon,
  TrashIcon,
  WarningOutlineIcon,
} from '@sanity/icons'
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
import { set, unset, useTranslation } from 'sanity'

import { useITSContext } from '../context/ITSCoreProvider'
import { VinofactWine } from '../types'
import { WinePreview } from './products/WinePreview'

export function VinofactWineSelector(props: any): ReactElement {
  const { value, onChange, readOnly } = props
  const { vinofactClient } = useITSContext()
  const { t } = useTranslation('studio')
  const toast = useToast()

  const [wines, setWines] = useState<VinofactWine[]>([])
  const [loading, setLoading] = useState(true)
  const [isReplacing, setIsReplacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!vinofactClient) {
      toast.push({
        status: 'error',
        title: 'Vinofact client not initialized.',
      })
      return
    }

    setError(null)

    vinofactClient
      .getWines()
      .then((data) => {
        const sorted = [...data.wines].sort((a, b) => {
          const titleComp = a.title.localeCompare(b.title) // Z-A
          if (titleComp !== 0) return titleComp
          return (Number(b.year) || 0) - (Number(a.year) || 0)
        })
        setWines(sorted)
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch wines from Vinofact.')
      })
      .finally(() => setLoading(false))
  }, [vinofactClient])

  const options = useMemo(
    () =>
      wines.map((w) => ({
        value: w.id,
        payload: w,
      })),
    [wines],
  )

  const selectedWine = useMemo(() => wines.find((w) => w.id === value), [wines, value])

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id ? set(id) : unset())
      setIsReplacing(false)
    },
    [onChange],
  )

  const openEditUrl = () => {
    if (selectedWine?.editUrl) window.open(selectedWine.editUrl, '_blank')
  }

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
                  onClick={() => handleSelect('')}
                />
                <MenuItem
                  text={t('inputs.reference.action.replace')}
                  icon={SyncIcon}
                  onClick={() => setIsReplacing(true)}
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

  // --- SEARCH STATE (The Autocomplete) ---
  return (
    <Autocomplete
      id="wine-autocomplete"
      loading={loading}
      // icon={SearchIcon}
      openButton
      options={options}
      placeholder={t('inputs.reference.search-placeholder')}
      onSelect={handleSelect}
      // Custom Filter (Searches Title + Year)
      filterOption={(query, option) => 
        `${option.payload.title} ${option.payload.year}`.toLowerCase().includes(query.toLowerCase())
      }

      // Rich Dropdown Items
      renderOption={(option) => (
        <Card as="button" padding={3} radius={0} borderBottom>
          <WinePreview wine={option.payload} />
        </Card>
      )}

      // What to display in the text field when an item is chosen
      renderValue={(val, option) => option?.payload.title || val}
      
      readOnly={readOnly}
    />
  )
}

