import { SparklesIcon, TrashIcon } from '@sanity/icons'
import { Button, Card, Flex, Spinner, Stack, Text, useToast } from '@sanity/ui'
import { fromString as pathFromString } from '@sanity/util/paths'
import { nanoid } from 'nanoid/non-secure'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { ArrayOfObjectsInputProps, SanityDocument, set, useFormValue } from 'sanity'
import { usePaneRouter } from 'sanity/structure'
import { v4 as uuidv4 } from 'uuid'

import { useITSContext } from '../context/ITSCoreProvider'
import { DocumentReference, VariantOption } from '../types'
import { ConfirmButton } from './ConfirmButton'

type Props = Omit<ArrayOfObjectsInputProps, 'value'> & {
  value?: DocumentReference[]
}

export const EditGroupOptions = (props: Props): ReactElement => {
  const { t, localizer, config, sanityClient } = useITSContext()

  const { value, onChange } = props
  const toast = useToast()
  const [options, setOptions] = useState<VariantOption[]>([])
  const [loading, setLoading] = useState(false)
  const { routerPanesState, groupIndex, handleEditReference } = usePaneRouter()
  const originalDocument = useFormValue([]) as SanityDocument

  // useEffect(() => {
  const fetchData = useCallback(async () => {
    if (!value || value.length === 0) {
      setOptions([])
      return
    }

    try {
      const ids = value.map((ref) => ref._ref)
      const draftIds = ids.map((id) => `drafts.${id}`)
      // 1. Fetch both published and draft versions
      // 2. We use a GROQ trick to group them by their "base ID"
      const query = `*[_type == "variantOption" && (_id in $ids || _id in $draftIds)] {
        _id,
        title,
        sortOrder
      }`
      const data: VariantOption[] = await sanityClient.fetch(query, { ids, draftIds })

      // 3. De-duplicate: If both draft and published exist, pick the draft.
      const merged = ids
        .map((baseId) => {
          const draft = data.find((d) => d._id === `drafts.${baseId}`)
          const published = data.find((d) => d._id === baseId)
          return draft || published
        })
        .filter(Boolean) as VariantOption[]

      const sorted = merged.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      setOptions(sorted)
    } catch (error) {
      toast.push({
        status: 'error',
        title: t('ui.errors.failedToLoad', { errorMessage: error }),
      })
    }
  }, [value, sanityClient, t, toast])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setLoading(true)
      await fetchData()
      if (isMounted) setLoading(false)
    }

    loadData()

    if (!value || value.length === 0) {
      return () => {
        isMounted = false
      }
    }

    const ids = value.map((ref) => ref._ref)
    const draftIds = ids.map((id) => `drafts.${id}`)

    // One listener for all related options
    const sub = sanityClient
      .listen(
        `*[_type == "variantOption" && (_id in $ids || _id in $draftIds)]`,
        { ids, draftIds },
        { visibility: 'query' },
      )
      .subscribe(() => fetchData())

    return () => {
      isMounted = false
      sub.unsubscribe()
    }
  }, [value, sanityClient, fetchData])

  const handleOptionClick = useCallback(
    (optionValueId: string) => {
      const childParams = routerPanesState[groupIndex + 1]?.[0].params || {}
      const { parentRefPath } = childParams
      const cleanId = optionValueId.replace('drafts.', '')

      handleEditReference({
        id: cleanId,
        type: 'variantOption',
        parentRefPath: parentRefPath ? pathFromString(parentRefPath) : [``],
        template: { id: optionValueId },
      })
    },
    [routerPanesState, groupIndex, handleEditReference],
  )

  const deleteOption = useCallback(
    async (optionId: string) => {
      if (!value) return
      const query = `count(*[_type == "productVariant" && references($id)]) > 0`
      const isUsed = await sanityClient.fetch(query, { id: optionId })

      if (isUsed) {
        toast.push({
          status: 'warning',
          title: t('optionsGroups.couldNotDeleteOption'),
        })
      } else {
        const transaction = sanityClient.transaction()
        transaction.patch(originalDocument._id, (patch) =>
          patch.set({ options: value?.filter((ref) => ref._ref !== optionId) }),
        )
        transaction.delete(optionId)

        try {
          await transaction.commit()
        } catch (error) {
          toast.push({
            status: 'error',
            title: t('ui.errors.failedToLoad', { errorMessage: error }),
          })
        }
      }
    },
    [sanityClient, originalDocument, value, t, toast],
  )

  const handleRemove = useCallback(
    async (optionId: string) => {
      setLoading(true)
      await deleteOption(optionId)
      setLoading(false)
    },
    [deleteOption],
  )

  const handleAddOption = useCallback(async () => {
    setLoading(true)
    const maxSort = options.reduce((max, opt) => Math.max(max, opt.sortOrder ?? 0), 0)

    const newOption = await sanityClient.create({
      _id: uuidv4().replaceAll('-', ''),
      _type: 'variantOption',
      title: [
        { _key: config.localization.defaultLocale, value: t('optionsGroups.defaults.title') },
      ],
      sortOrder: maxSort + 1,
    })

    const newValues = value ? value : []
    const newRef = { _type: 'reference', _ref: newOption._id, _key: nanoid(8) }
    onChange(set([...newValues, newRef]))
    handleOptionClick(newOption._id)
    setLoading(false)
  }, [options, sanityClient, config, t, value, onChange, handleOptionClick])

  const OptionItem = ({
    option,
    onEdit,
    onRemove,
  }: {
    option: VariantOption
    onEdit: (id: string) => void
    onRemove: (id: string) => void
  }) => {
    const baseId = option._id.replace('drafts.', '')
    const isDraft = option._id.startsWith('drafts.')
    const tone = isDraft ? 'caution' : 'positive'

    // These functions are now stable for this specific item
    const handleClick = useCallback(() => onEdit(baseId), [baseId, onEdit])
    const handleConfirmRemove = useCallback(() => onRemove(baseId), [baseId, onRemove])

    return (
      <Card padding={3} radius={2} shadow={1}>
        <Flex justify="space-between" align="center" gap={2}>
          <Button
            mode="ghost"
            tone={tone}
            onClick={handleClick} // No arrow function here
            style={{
              whiteSpace: 'normal',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'left',
              lineHeight: '1.4',
            }}
          >
            <Stack space={1}>
              <Text>{localizer.value(option.title) || t('optionsGroups.defaults.title')}</Text>
            </Stack>
          </Button>
          <ConfirmButton
            onConfirm={handleConfirmRemove} // No arrow function here
            confirmText={t('optionsGroups.confirmDelete')}
            icon={TrashIcon}
            tone="critical"
          />
        </Flex>
      </Card>
    )
  }

  return loading ? (
    <Spinner muted />
  ) : (
    <Stack space={3}>
      {options.map((option) => (
        <OptionItem
          key={option._id}
          option={option}
          onEdit={handleOptionClick}
          onRemove={handleRemove}
        />
      ))}
      <Button
        icon={SparklesIcon}
        text={t('optionsGroups.addOption')}
        tone="positive"
        onClick={handleAddOption}
      />
    </Stack>
  )
}
