import { SparklesIcon, TrashIcon } from '@sanity/icons'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Grid,
  Inline,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@sanity/ui'
import { fromString as pathFromString } from '@sanity/util/paths'
import { nanoid } from 'nanoid/non-secure'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { ArrayOfObjectsInputProps, set, useFormValue } from 'sanity'
import { usePaneRouter } from 'sanity/structure'
import { v4 as uuidv4 } from 'uuid'

import { useITSContext } from '../context/ITSCoreProvider'
import { DocumentReference, Product, VariantContainer, VariantOptionGroup } from '../types'
import { ConfirmButton } from './ConfirmButton'
import { Details } from './Details'
import { LoadingBox } from './LoadingBox'
import { ProductVariantItem } from './ProductVariantItem'

type VariantsInputProps = Omit<ArrayOfObjectsInputProps, 'value'> & {
  value: DocumentReference[]
}

type ResolvedReference = {
  _id: string
  _type: string
}
type VariantReferences = {
  _id: string
  references: ResolvedReference[]
}

const OptionCheckbox = memo(
  ({
    option,
    groupId,
    isSelected,
    onToggle,
    localizer,
  }: {
    option: any
    groupId: string
    isSelected: boolean
    onToggle: (gId: string, oId: string) => void
    localizer: any
  }) => {
    // This function is now stable for this specific checkbox
    const handleChange = useCallback(() => {
      onToggle(groupId, option._id)
    }, [groupId, option._id, onToggle])

    return (
      <Flex align="center">
        <Checkbox
          id={option._id}
          checked={isSelected}
          onChange={handleChange} // No more arrow function!
        />
        <Box flex={1} paddingLeft={3}>
          <Text>{localizer.value(option.title)}</Text>
        </Box>
      </Flex>
    )
  },
)

// Set a display name for devtools
OptionCheckbox.displayName = 'OptionCheckbox'

export function GenerateVariants(props: VariantsInputProps): React.ReactElement {
  const { t, localizer, featureRegistry, sanityClient } = useITSContext()

  const toast = useToast()
  const [isDialogOpen, setDialogOpen] = useState(false)
  const { onChange, value } = props

  const [loading, setLoading] = useState(true)
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [variantOptionGroups, setVariantOptionGroups] = useState<VariantOptionGroup[]>([])
  const [variants, setVariants] = useState<VariantContainer[]>([])
  const [variantIdLoading, setVariantIdLoading] = useState<string | undefined>(undefined)
  const originalDocument = useFormValue([]) as Product
  const { routerPanesState, groupIndex, handleEditReference } = usePaneRouter()

  const fetchVariants = useCallback(async () => {
    if (!value) return

    if (value.length > 0) {
      setLoadingVariants(true)
      try {
        const fields = `
          _id,
          _rev,
          _type,
          options[]->{_id, title},
          title,
          featured,
          active,
          price,
          sku,
          images
        `
        const query = `*[_type == "productVariant" && _id in $ids] {
          _id,
          "published": *[_type == "productVariant" && _id == ^._id][0]{${fields}},
          "draft": *[_type == "productVariant" && _id == "drafts." + ^._id][0]{${fields}}
        }`

        const ids = value.map((ref) => ref._ref)
        const data = await sanityClient.fetch(query, { ids })
        setVariants(data)
      } catch (error) {
        // Use toast or a similar UI notification here to avoid console.error linting
        toast.push({
          status: 'error',
          title: t('ui.errors.failedToLoad', { errorMessage: error }),
        })
      } finally {
        setLoadingVariants(false)
      }
    } else {
      setVariants([])
    }
  }, [value, sanityClient, t, toast]) // All external dependencies go here

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = `*[_type == "variantOptionGroup" && options != null] | order(sortOrder asc, title asc) {
          _id,
          sortOrder,
          title,
          options[]->{_id, title}
        }`
        const data = await sanityClient.fetch(query)
        setVariantOptionGroups(data)
      } catch (error) {
        console.error('Error fetching product groups:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sanityClient])

  useEffect(() => {
    if (!value || value.length === 0) {
      // Optionally fetch here if you want to clear the UI state
      if (value) fetchVariants()
      return () => {}
    }
    fetchVariants()

    const newSubscriptions = value.map((variantRef) => {
      if (!variantRef?._ref) return null

      return sanityClient
        .listen(
          `*[_id == $id || _id == $draftId]`,
          { id: variantRef._ref, draftId: `drafts.${variantRef._ref}` },
          { visibility: 'query' },
        )
        .subscribe(() => {
          fetchVariants()
        })
    })

    // Now this return is reached consistently if the "if" guards aren't met
    return () => {
      newSubscriptions.forEach((sub) => sub?.unsubscribe())
    }
  }, [value, sanityClient, fetchVariants])

  const getCombinations = (
    arr: Array<Array<{ groupId: string; optionId: string }>>,
  ): Array<Array<{ groupId: string; optionId: string }>> => {
    if (arr.some((inner) => inner.length === 0)) return []

    // Helper function to generate all combinations of arrays
    const result: Array<Array<{ groupId: string; optionId: string }>> = []

    function combine(
      input: Array<Array<{ groupId: string; optionId: string }>>,
      index = 0,
      current: Array<{ groupId: string; optionId: string }> = [],
    ) {
      if (index === input.length) {
        result.push(current)
        return
      }

      for (let i = 0; i < input[index].length; i++) {
        combine(input, index + 1, [...current, input[index][i]])
      }
    }

    combine(arr)
    return result
  }

  const generateVariants = useCallback(async () => {
    if (Object.keys(selectedOptions).length === 0) {
      return []
    }
    setLoadingVariants(true)

    // get the selected options for all groups
    const selected = Object.keys(selectedOptions).map((groupId) => {
      return selectedOptions[groupId].map((optionId) => {
        return {
          groupId,
          optionId,
        }
      })
    })

    // generate all possible combinations of selected options
    const combinations = getCombinations(selected)

    // create productVariant documents based on combinations
    const newVariants = combinations.map((combination, variantIndex) => {
      const optionRefs = combination.map((ref) => {
        return {
          _type: 'reference',
          _ref: ref.optionId,
          _key: nanoid(8),
        }
      })

      const newVariant = {
        _id: uuidv4().replaceAll('-', ''),
        _type: 'productVariant',
        title: originalDocument.title,
        ...(originalDocument.sku && { sku: `${originalDocument.sku} - ${variantIndex + 1}` }),
        options: optionRefs,
        featured: variantIndex === 0,
        active: true,
        ...(featureRegistry.isFeatureEnabled('shop.stock') && { stock: 0 }),
      }
      return newVariant
    })

    const transaction = sanityClient.transaction()
    //create variants
    newVariants.forEach((variant) => transaction.create(variant))

    try {
      await transaction.commit()
      //create variant refs on transactionsuccess
      const variantRefs = newVariants.map((variant) => ({
        _type: 'reference',
        _ref: variant._id,
        _key: nanoid(8),
      }))
      onChange(set(variantRefs))
      setSelectedOptions({})
    } catch (error) {
      console.error('Transaction failed:', error)
    }

    setLoadingVariants(false)
    return newVariants
  }, [onChange, sanityClient, originalDocument, selectedOptions, featureRegistry])

  const handleDialogOpen = useCallback(() => setDialogOpen(true), [])
  const handleDialogCancel = useCallback(() => setDialogOpen(false), [])
  const handleDialogSubmit = useCallback(async () => {
    await generateVariants()
    setDialogOpen(false)
  }, [generateVariants])

  const toggleOption = useCallback((groupId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const groupOptions = prev[groupId] || []
      const isAlreadySelected = groupOptions.includes(optionId)

      // Determine the new array for this specific group
      const updatedGroupOptions = isAlreadySelected
        ? groupOptions.filter((id) => id !== optionId)
        : [...groupOptions, optionId]

      // If the group is now empty, we remove it from the state entirely
      if (updatedGroupOptions.length === 0) {
        return Object.fromEntries(Object.entries(prev).filter(([key]) => key !== groupId))
      }

      // Otherwise, return the updated state with the new group options
      return {
        ...prev,
        [groupId]: updatedGroupOptions,
      }
    })
  }, []) // setSelectedOptions is stable, so the dependency array is empty

  const groupOptionsSelected = (groupId: string) => {
    const numOptions = selectedOptions[groupId] ? selectedOptions[groupId].length : 0
    return numOptions
  }

  const deleteVariants = useCallback(
    async (variantIds: string[]) => {
      // first check if any variants are referenced anywhere else
      const refQuery = `
        *[_type == "productVariant" && _id in $ids] {
          _id,
          "references": *[references(^._id) && _id != $productId] { _id, _type }
        }
      `
      const variantRefs: VariantReferences[] = await sanityClient.fetch(refQuery, {
        ids: variantIds,
        productId: originalDocument._id,
      })
      const variantIdsToDelete = variantRefs
        .filter((ref) => ref.references.length === 0)
        .map((ref) => ref._id)
      if (variantIdsToDelete.length > 0) {
        const transaction = sanityClient.transaction()

        transaction.patch(originalDocument._id, (patch) =>
          patch.set({
            variants: value.filter((ref) => !variantIdsToDelete.includes(ref._ref)),
          }),
        )

        variantIdsToDelete.forEach((variantId) => transaction.delete(variantId))
        try {
          await transaction.commit()
          // fetchVariants();
        } catch (error) {
          toast.push({
            status: 'error',
            title: t('ui.errors.failedToLoad', { errorMessage: error }),
          })
        }
      }
      if (variantIdsToDelete.length < variantIds.length) {
        toast.push({
          status: 'warning',
          title: t('variants.couldNotDeleteAll'),
        })
      }
    },
    [sanityClient, originalDocument, value, t, toast],
  )

  // Clear out existing variants
  const handleClear = useCallback(async () => {
    setLoadingVariants(true)
    await deleteVariants(value.map((ref) => ref._ref))
    setLoadingVariants(false)
  }, [deleteVariants, value])

  const handleVariantRefClick = useCallback(
    async (variantId: string) => {
      const childParams = routerPanesState[groupIndex + 1]?.[0].params || {}
      const { parentRefPath } = childParams

      handleEditReference({
        id: variantId,
        type: 'productVariant',
        // Uncertain that this works as intended
        parentRefPath: parentRefPath ? pathFromString(parentRefPath) : [``],
        template: { id: variantId },
      })
    },
    [groupIndex, handleEditReference, routerPanesState],
  )

  const handleVariantDeleteClick = useCallback(
    async (variantId: string) => {
      setVariantIdLoading(variantId)
      await deleteVariants([variantId])
      // delete published variant ref
      // onChange(set(value.filter(ref => ref._ref != variantId)));
      setVariantIdLoading(undefined)
    },
    [deleteVariants],
  )

  return loading ? (
    <Spinner muted />
  ) : (
    <Stack space={3}>
      {variants.length == 0 && (
        <Button
          style={{ cursor: 'pointer' }}
          icon={SparklesIcon}
          text={t('variants.generate')}
          tone="positive"
          disabled={loadingVariants}
          onClick={handleDialogOpen}
        />
      )}
      <Grid columns={1}>
        <Stack space={3}>
          {variants?.map((variant) => (
            <ProductVariantItem
              key={variant._id}
              variant={variant}
              variantOptionGroups={variantOptionGroups}
              product={originalDocument}
              onClick={handleVariantRefClick}
              onDelete={handleVariantDeleteClick}
              loading={variantIdLoading == variant._id}
            />
          ))}
        </Stack>
      </Grid>
      {variants.length > 0 && (
        <ConfirmButton
          style={{ cursor: 'pointer' }}
          text={t('variants.deleteAll.title')}
          confirmText={t('variants.deleteAll.confirm')}
          icon={TrashIcon}
          tone="critical"
          onConfirm={handleClear}
          disabled={loadingVariants}
        />
      )}

      {isDialogOpen && (
        <Dialog
          header={
            <Card paddingTop={3}>
              <Inline space={2}>
                <Button
                  style={{ cursor: 'pointer' }}
                  text={`${t('variants.generate')}`}
                  tone="primary"
                  onClick={handleDialogSubmit}
                  disabled={
                    !Object.values(selectedOptions).some((options) => options.length > 0) ||
                    loadingVariants
                  }
                />
              </Inline>
            </Card>
          }
          id="generate-variants-dialog"
          onClose={handleDialogCancel}
          width={1}
        >
          <LoadingBox
            content={
              <Stack space={4}>
                {variantOptionGroups.map((group) => (
                  <Card key={group._id} padding={3} radius={2} shadow={1} tone="default">
                    <Details
                      title={
                        <Text weight="bold" size={2} style={{ cursor: 'pointer' }}>
                          {localizer.value(group.title)} ({groupOptionsSelected(group._id)}/
                          {group.options.length})
                        </Text>
                      }
                    >
                      <Stack space={3} padding={3}>
                        {group.options.map((option) => (
                          <Flex align="center" key={option._id}>
                            <Checkbox
                              id={option._id}
                              checked={(selectedOptions[group._id] || []).includes(option._id)}
                              onChange={() => toggleOption(group._id, option._id)}
                              label={localizer.value(option.title)}
                            />
                            <Box flex={1} paddingLeft={3}>
                              <Text>
                                <label htmlFor={option._id}>{localizer.value(option.title)}</label>
                              </Text>
                            </Box>
                          </Flex>
                        ))}
                      </Stack>
                    </Details>
                  </Card>
                ))}
              </Stack>
            }
            loading={loadingVariants}
          />
        </Dialog>
      )}
    </Stack>
  )
}
