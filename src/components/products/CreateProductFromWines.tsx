import { AddIcon, SearchIcon } from '@sanity/icons'
import { Box, Button, Dialog, Flex, Stack, TextInput, useToast } from '@sanity/ui'
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

import { useITSContext } from '../../context/ITSCoreProvider'
import { VinofactWine } from '../../types'
import { WineImporterList } from './WineImporterList'

export function CreateProductFromWines(props: any): ReactElement {
  const { vinofactClient, sanityClient } = useITSContext()
  const toast = useToast()

  const isFieldInput = Boolean(props.elementProps)
  // const initialIds = useMemo(() => {
  //   if (!props.value) return []
  //   return props.value.map((ref: any) => ref._ref)
  // }, [props.value])

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [wines, setWines] = useState<VinofactWine[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  // const [selectedIds, setSelectedIds] = useState<string[]>(initialIds)

  // useEffect(() => {
  //   setSelectedIds(initialIds)
  // }, [initialIds])

  const fetchExistingWineIds = useCallback(async () => {
    if (!props.value || props.value.length === 0) {
      setSelectedIds([])
      return
    }

    // Get all the _refs from the current array
    const refs = props.value.map((val: any) => val._ref)

    // Query Sanity: "Get the wineId for all these variant IDs"
    const query = `*[_id in $refs].vinofactWineId`
    try {
      const result = await sanityClient.fetch(query, { refs })
      setSelectedIds(result.filter(Boolean)) // Only keep non-null wineIds
    } catch (err: any) {
      toast.push({
        status: 'error',
        title: 'Fetch failed.',
        description: err.message,
      })
      console.error('Failed to fetch variant wineIds', err)
    }
  }, [props.value, sanityClient])

  useEffect(() => {
    if (open && isFieldInput) fetchExistingWineIds()
  }, [open, isFieldInput, fetchExistingWineIds])

  const loadWines = useCallback(async () => {
    if (!vinofactClient) {
      toast.push({
        status: 'error',
        title: 'Vinofact client not initialized.',
        description: 'Check your shop configuration features.',
      })
      setOpen(false) // Close the dialog if it was somehow open
      return
    }

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
    } finally {
      setLoading(false)
    }
  }, [vinofactClient, toast])

  useEffect(() => {
    if (open) loadWines()
  }, [open, loadWines])

  // EVENT HANDLER: Use this for the button click
  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  // Filter wines based on search input
  const filteredWines = useMemo(() => {
    return wines.filter((wine) => wine.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [wines, searchQuery])

  // Toggle selected wines
  const handleToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.currentTarget.value
    const checked = event.currentTarget.checked

    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)))
  }, [])

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value)
  }, [])

  return (
    <Stack>
      <Button icon={AddIcon} mode="ghost" text="Wein" onClick={handleOpen} />
      {open && (
        <Dialog
          header="Select Wines"
          id="wine-dialog"
          onClose={handleClose}
          width={1}
          footer={
            <Box padding={3}>
              <Flex gap={2} justify="flex-end">
                <Button text="Cancel" mode="ghost" onClick={handleClose} />
                <Button
                  text={`Import ${selectedIds.length} Wines`}
                  // onClick={handleCreateProduct}
                  tone="primary"
                  loading={loading}
                  disabled={selectedIds.length === 0}
                />
              </Flex>
            </Box>
          }
        >
          <Flex direction="column" style={{ height: '60vh' }}>
            <Box padding={4}>
              <TextInput
                icon={SearchIcon}
                placeholder="Search wines..."
                onChange={handleSearchChange}
                value={searchQuery}
              />
            </Box>

            {/* This Box grows to fill space and enables scrolling */}
            <Box paddingX={4} flex={1} overflow="auto">
              <WineImporterList
                wines={filteredWines}
                selectedIds={selectedIds}
                onToggle={handleToggle}
              />
            </Box>
          </Flex>
        </Dialog>
      )}
    </Stack>
  )
}
