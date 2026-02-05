import { useITSContext } from '../context/ITSCoreProvider'
import { VinofactWine } from '../types'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Card, Stack, Text, Flex, Badge, Box, TextInput, Spinner, Button, Inline, Popover, Menu, MenuItem, MenuButton, MenuDivider } from '@sanity/ui'
import { SearchIcon, ChevronDownIcon, CalendarIcon, EllipsisHorizontalIcon, TrashIcon, SyncIcon, LaunchIcon } from '@sanity/icons'
import { set, unset, useTranslation } from 'sanity'

export function VinofactWineSelector(props: any) {
  const { value, onChange, readOnly } = props
  const { vinofactClient } = useITSContext()
  const { t } = useTranslation('studio')

  const [wines, setWines] = useState<VinofactWine[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  // Update popover width to match input width
  // Measure width for the popover
  useEffect(() => {
    if (containerRef.current) setWidth(containerRef.current.offsetWidth)
  }, [isOpen])

  // Click Outside logic
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('mousedown', handleOutside)
    return () => window.removeEventListener('mousedown', handleOutside)
  }, [])

  // 1. Data Fetching & Sorting
  useEffect(() => {
    if (!vinofactClient) return
    setLoading(true)
    vinofactClient.getWines()
      .then((data) => {
        const sorted = [...data.wines].sort((a, b) => {
          const titleComp = a.title.localeCompare(b.title)
          if (titleComp !== 0) return titleComp
          return (Number(b.year) || 0) - (Number(a.year) || 0)
        })
        setWines(sorted)
      })
      .finally(() => setLoading(false))
  }, [vinofactClient])

  const filteredWines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return wines.filter(w => 
      w.title.toLowerCase().includes(q) || (w.year && w.year.includes(q))
    )
  }, [wines, searchQuery])

  const selectedWine = useMemo(() => wines.find(w => w.id === value), [wines, value])

  const handleSelect = useCallback((id: string | null) => {
    console.log("Selecting Wine ID:", id) // Debugging check
    onChange(id ? set(id) : unset())
    setSearchQuery('')
    setTimeout(() => setIsOpen(false), 50)
  }, [onChange])

  const handleReplace = () => {
    setSearchQuery('')
    // We keep the value but trigger the search UI
    setIsOpen(true)
    // To mimic "Replace", we effectively act as if nothing is selected for the UI
    onChange(unset()) 
  }

  const openEditUrl = () => {
    if (selectedWine?.editUrl) window.open(selectedWine.editUrl, '_blank')
  }

  return (
    <Box ref={containerRef}>
      {selectedWine && !isOpen ? (
        <Card border radius={1} padding={2}>
          <Flex align="center">
            <Box flex={1} onClick={openEditUrl} style={{ cursor: 'pointer' }}>
              <Card padding={2} radius={1}>
                <Flex align="center" gap={3}>
                  <Box flex={1}>
                    <Stack space={2}>
                      <Text size={1} weight="semibold">{selectedWine.title}</Text>
                      <Text size={1} muted>{selectedWine.year || 'N/V'} — {selectedWine.slug}</Text>
                    </Stack>
                  </Box>
                </Flex>
              </Card>
            </Box>
            
            <MenuButton
              button={<Button mode="bleed" icon={EllipsisHorizontalIcon} />}
              id="wine-menu"
              menu={
                <Menu>
                  <MenuItem text={t('inputs.reference.action.clear')} icon={TrashIcon} tone="critical" onClick={() => handleSelect(null)} />
                  <MenuItem text={t('inputs.reference.action.replace')} icon={SyncIcon} onClick={handleReplace} />
                  <MenuDivider />
                  <MenuItem text={t('inputs.reference.action.open-in-new-tab')} icon={LaunchIcon} onClick={openEditUrl} />
                </Menu>
              }
              // placement="bottom-end"
              // portal
            />
          </Flex>
        </Card>
      ) : (
        <Popover
          open={isOpen}
          portal
          placement="bottom"
          // Force popover to match the input width
          content={
            <Card shadow={3} style={{ width }} overflow="hidden">
              <Box style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {loading ? (
                  <Flex align="center" justify="center" padding={4}><Spinner /></Flex>
                ) : (
                  <Stack space={0}>
                    {filteredWines.map(w => (
                      <Card 
                        key={w.id} 
                        as="button" 
                        // onClick={() => handleSelect(w.id)} 
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevents input from losing focus immediately
                          handleSelect(w.id);
                        }}
                        padding={3} 
                        radius={0} 
                        style={{ width: '100%', textAlign: 'left', borderBottom: '1px solid var(--card-border-color)' }}
                      >
                        <Stack space={2}>
                          <Text weight="semibold" size={1}>{w.title}</Text>
                          <Inline space={2}>
                            <Badge><Flex align="center" gap={1}><CalendarIcon /> {w.year || 'N/V'}</Flex></Badge>
                            <Text size={1} muted>/{w.slug}</Text>
                          </Inline>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            </Card>
          }
        >
          <Box style={{ position: 'relative' }}>
            <TextInput
              // icon={SearchIcon}
              placeholder={t('inputs.reference.search-placeholder')}
              value={searchQuery}
              autoFocus={isOpen}
              onChange={(e) => {
                setSearchQuery(e.currentTarget.value)
                if (!isOpen) setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              fontSize={2}
              // Suffix is an element, not a component
              suffix={
                <Flex padding={1} align="center">
                  <Button 
                    mode="bleed" 
                    icon={ChevronDownIcon} 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents input focus double-trigger
                      setIsOpen(!isOpen);
                    }}
                    fontSize={1}
                    padding={2}
                  />
                </Flex>
              }
            />
          </Box>
        </Popover>
      )}
    </Box>
  )
}