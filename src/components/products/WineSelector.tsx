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
import { FormField, type ObjectInputProps, PatchEvent, set, unset } from 'sanity'

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

export function WineSelector(props: ObjectInputProps): ReactElement {
  const { value, onChange, readOnly, elementProps, members, renderDefault, renderField } = props

  const wineIdMember = members.find((m) => m.kind === 'field' && m.name === 'vinofactWineId')
  // if (wineIdMember) {
  //   if (wineIdMember?.kind === 'field') {
  //     wineIdMember.
  //   }
  // }
  // const otherFields = members.filter(
  //   (member) => member.kind === 'field' && member.name !== 'vinofactWineId',
  // )
  const renderFieldOverride = useCallback(
    (fieldProps: any) => {
      if (fieldProps.name === 'vinofactWineId') return null
      return renderField(fieldProps)
    },
    [renderField],
  )

  const wineIdMarkers = wineIdMember?.kind === 'field' ? wineIdMember.field.validation : []
  const wineIdHasError = wineIdMarkers.some((m) => m.level === 'error')
  const wineIdHasWarning = wineIdMarkers.some((m) => m.level === 'warning')
  const wineIdWarningTone = wineIdHasWarning ? 'caution' : 'default'
  const wineIdTone = wineIdHasError ? 'critical' : wineIdWarningTone

  // const validationErrors = useMemo(
  //   () => validation.filter((error) => error.path.includes('vinofactWineId')),
  //   [validation],
  // )

  // const hasError = validationErrors.length > 0

  const { vinofactClient, studioT } = useITSContext()
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

  const selectedWine = useMemo(
    () => wines.find((w) => w.id === value?.vinofactWineId),
    [wines, value],
  )

  const handleSelect = useCallback(
    (id: string) => {
      const selection = wines.find((w) => w.id === id)
      if (selection) {
        onChange(
          PatchEvent.from([
            set(selection.id, ['vinofactWineId']),
            set(selection.year, ['vintage']),
          ]),
        )
      } else {
        onChange(unset(['vinofactWineId']))
      }
      setIsReplacing(false)
    },
    [onChange, wines],
  )
  const handleClearSelection = useCallback(() => {
    onChange(unset(['vinofactWineId']))
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

  const wineField =
    selectedWine && !isReplacing ? (
      <Card border radius={2} padding={1}>
        <Flex align="center">
          <Box flex={1} onClick={openEditUrl} style={{ cursor: 'pointer' }}>
            <Card padding={2} radius={1} tone={wineIdTone}>
              <WinePreview wine={selectedWine} />
            </Card>
          </Box>
          <MenuButton
            button={<Button mode="bleed" icon={EllipsisHorizontalIcon} />}
            id="wine-menu"
            menu={
              <Menu>
                <MenuItem
                  text={studioT('inputs.reference.action.clear')}
                  icon={TrashIcon}
                  tone="critical"
                  onClick={handleClearSelection}
                />
                <MenuItem
                  text={studioT('inputs.reference.action.replace')}
                  icon={SyncIcon}
                  onClick={handleIsReplacing}
                />
                <MenuDivider />
                <MenuItem
                  text={studioT('inputs.reference.action.open-in-new-tab')}
                  icon={LaunchIcon}
                  onClick={openEditUrl}
                />
              </Menu>
            }
          />
        </Flex>
      </Card>
    ) : (
      <Autocomplete
        // id="wine-autocomplete"
        loading={loading}
        // icon={SearchIcon}
        {...elementProps}
        openButton
        options={options}
        placeholder={studioT('inputs.reference.search-placeholder')}
        onSelect={handleSelect}
        // Custom Filter (Searches Title + Year)
        filterOption={filterOption}
        renderOption={renderOption}
        // What to display in the text field when an item is chosen
        renderValue={renderValue}
        readOnly={readOnly}
      />
    )

  return (
    <Stack space={3}>
      {wineIdMember && wineIdMember.kind === 'field' && (
        <Stack space={2}>
          {/* This renders the Label and Description automatically */}
          {/* <Text size={1} weight="semibold">
            {wineIdMember.field.schemaType.title}
          </Text>
          {wineIdMember.field.schemaType.description && (
            <Text size={1} muted>
              {wineIdMember.field.schemaType.description}
            </Text>
          )} */}
          <FormField
            title={wineIdMember?.field.schemaType.title}
            description={wineIdMember?.field.schemaType.description}
            validation={wineIdMember?.field.validation} // This renders the red error text below the input
          >
            {wineField}
          </FormField>
        </Stack>
      )}
      {renderDefault({ ...props, renderField: renderFieldOverride })}
      {/* <Card radius={2}>
        <Stack space={4}>
          {otherFields.map((member) => {
            if (member.kind !== 'field') return null
            return (
              <MemberField
                key={member.key}
                member={member}
                renderField={renderField}
                renderInput={renderInput}
                renderPreview={renderPreview}
                renderItem={renderItem}
              />
            )
          })}
        </Stack>
      </Card> */}
    </Stack>
  )
}
