/* eslint-disable max-nested-callbacks */
/* eslint-disable no-nested-ternary */
import { Badge, Card, Flex, Grid, Stack, Text, useToast } from '@sanity/ui'
import { ReactElement } from 'react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { cartesian } from '../../../../lib/shop/productVariant.tx'
import { uid } from '../../../../utils/utils'
import { I18nTitleInputs } from '../fields/I18nTitleField'
import { PriceField } from '../fields/PriceField'
import { SectionLabel } from '../fields/SectionLabel'
import { TaxCategoryField } from '../fields/TaxCategoryField'
import { VariantSectionHeader } from '../fields/VariantSectionHeader'
import {
  CombinationRow,
  I18nTitleEntry,
  OptionComboCardProps,
  OptionGroup,
  OptionToggleCardProps,
  PhysicalDigitalTabProps,
} from '../ProductCreator.types'
import { ProductTab } from './ProductTab'
import { VariantRow } from '../fields/VariantRow'

/** Build combination rows from selected options per group */
function buildCombinations(
  groups: OptionGroup[],
  selectedOptions: Record<string, string[]>,
  existingOptionSets?: Set<string>,
): CombinationRow[] {
  // Only groups that have at least one option selected
  const activeGroups = groups.filter((g) => (selectedOptions[g._id] ?? []).length > 0)
  if (activeGroups.length === 0) return []

  const optionSets = activeGroups.map((g) => selectedOptions[g._id] ?? [])
  const combos = cartesian(optionSets)

  return combos.map((optionIds) => {
    const key = [...optionIds].sort().join('|')
    const alreadyExists = existingOptionSets?.has(key) ?? false
    return {
      id: uid(),
      optionIds,
      enabled: !alreadyExists, // pre-disabled if already exists
      alreadyExists, // new field on CombinationRow
      price: undefined,
      taxCategoryId: '',
      titles: [],
    }
  })
}

const OptionToggleCard = memo(function OptionToggleCard({
  groupId,
  option,
  checked,
  onToggle,
}: OptionToggleCardProps) {
  const handleClick = useCallback(
    () => onToggle(groupId, option._id, !checked),
    [groupId, option._id, checked, onToggle],
  )

  return (
    <Card
      as="button"
      padding={2}
      radius={2}
      border
      tone={checked ? 'positive' : 'default'}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <Text size={1}>{option.title}</Text>
    </Card>
  )
})

const OptionComboCard = memo(function OptionComboCard(props: OptionComboCardProps) {
  const {
    row,
    index,
    label,
    loadingTax,
    taxCategories,
    locales,
    defaultLocale,
    titlePlaceholder,
    onUpdate,
    onToggleCombination,
  } = props
  const { componentT } = useITSContext()

  const handleCombinationToggle = useCallback(
    () => onToggleCombination(row.id),
    [onToggleCombination, row.id],
  )

  const handlePriceChange = useCallback(
    (value: number | undefined) => onUpdate(row.id, 'price', value),
    [onUpdate, row.id],
  )

  const handleTaxChange = useCallback(
    (value: string) => onUpdate(row.id, 'taxCategoryId', value),
    [onUpdate, row.id],
  )

  const handleTitlesChange = useCallback(
    (titles: I18nTitleEntry[]) => onUpdate(row.id, 'titles', titles),
    [onUpdate, row.id],
  )

  return (
    <VariantRow
      index={index}
      tone={row.alreadyExists ? 'caution' : row.enabled ? 'default' : 'transparent'}
    >
      <Stack space={3}>
        <Grid columns={[1, 1, 4]} gap={3}>
          {/* Toggle + label */}
          <Flex align="center" gap={3} style={{ gridColumn: 'span 1' }}>
            <input
              type="checkbox"
              checked={row.enabled}
              onChange={handleCombinationToggle}
              disabled={row.alreadyExists}
              style={{ cursor: row.alreadyExists ? 'not-allowed' : 'pointer' }}
            />
            <Text
              size={1}
              weight="semibold"
              style={{
                textDecoration: row.enabled ? 'none' : 'line-through',
                opacity: row.enabled ? 1 : 0.5,
              }}
            >
              {label}
            </Text>
            {row.alreadyExists && (
              <Badge tone="caution" size={1}>
                {componentT.default('productCreatorTool.messages.variantExists')}
              </Badge>
            )}
          </Flex>

          {row.enabled && !row.alreadyExists && (
            <>
              <PriceField value={row.price} onChange={handlePriceChange} required={false} />
              <TaxCategoryField
                value={row.taxCategoryId}
                taxCategories={taxCategories}
                loadingTax={loadingTax}
                onTaxChange={handleTaxChange}
              />
            </>
          )}
        </Grid>

        {row.enabled && !row.alreadyExists && (
          <I18nTitleInputs
            locales={locales}
            defaultLocale={defaultLocale}
            requiredLocales={[]}
            required={false}
            titles={row.titles}
            onChange={handleTitlesChange}
            placeholder={titlePlaceholder}
          />
        )}
      </Stack>
    </VariantRow>
  )
})

export function PhysicalDigitalTab(props: PhysicalDigitalTabProps): ReactElement {
  const { titles, globalPrice, taxCategories, loadingTax, defaultLocale } = props.global
  const { onSubmit, submitting, existingOptionSets, hideProductSection } = props
  const { sanityClient, localizer, componentT } = useITSContext()
  const toast = useToast()

  const [groups, setGroups] = useState<OptionGroup[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  // selectedOptions: groupId → array of selected optionIds
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [combinations, setCombinations] = useState<CombinationRow[]>([])

  // Load groups + options
  useEffect(() => {
    sanityClient
      .fetch<{ groups: any[]; options: any[] }>(
        `{
          "groups": *[_type == "variantOptionGroup"] | order(sortOrder asc) {
            _id, title, sortOrder
          },
          "options": *[_type == "variantOption"] | order(sortOrder asc) {
            _id, title, sortOrder, "groupId": group._ref
          }
        }`,
      )
      .then(({ groups: rawGroups, options: rawOptions }) => {
        const built: OptionGroup[] = rawGroups.map((g) => ({
          _id: g._id,
          title: localizer.value(g.title) ?? g._id,
          sortOrder: g.sortOrder ?? 0,
          options: rawOptions
            // eslint-disable-next-line max-nested-callbacks
            .filter((o) => o.groupId === g._id)
            // eslint-disable-next-line max-nested-callbacks
            .map((o) => ({
              _id: o._id,
              title: localizer.value(o.title) ?? o._id,
              sortOrder: o.sortOrder ?? 0,
            })),
        }))
        setGroups(built)
      })
      .catch((err) => {
        toast.push({
          status: 'error',
          title: 'Failed to load option groups',
          description: err.message,
        })
      })
      .finally(() => setLoadingGroups(false))
  }, [sanityClient, localizer, toast])

  // Recompute combinations whenever selections change — always reset overrides
  useEffect(() => {
    setCombinations(buildCombinations(groups, selectedOptions, existingOptionSets))
  }, [groups, selectedOptions, existingOptionSets])

  const toggleOption = useCallback((groupId: string, optionId: string, checked: boolean) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] ?? []
      const next = checked ? [...current, optionId] : current.filter((id) => id !== optionId)
      return { ...prev, [groupId]: next }
    })
  }, [])

  const toggleCombination = useCallback((id: string) => {
    setCombinations((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)))
  }, [])

  const updateCombination = useCallback((id: string, key: keyof CombinationRow, val: string) => {
    setCombinations((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: val } : c)))
  }, [])

  // The groups that have at least one option selected, in order
  const activeGroups = useMemo(
    () => groups.filter((g) => (selectedOptions[g._id] ?? []).length > 0),
    [groups, selectedOptions],
  )

  const enabledCombinations = useMemo(
    () => combinations.filter((c) => c.enabled && !c.alreadyExists),
    [combinations],
  )

  const showWarning = enabledCombinations.length > 50

  const canSubmit = useMemo(() => {
    if (!hideProductSection) {
      const defaultTitle = titles.find((ts) => ts.locale === defaultLocale)?.value
      if (!defaultTitle?.trim()) return false
      if (!globalPrice && enabledCombinations.some((c) => !c.price)) return false
    }
    if (enabledCombinations.length === 0) return false
    return true
  }, [hideProductSection, titles, defaultLocale, globalPrice, enabledCombinations])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    await onSubmit(enabledCombinations)
    // Reset local state
    setSelectedOptions({})
    setCombinations([])
  }, [canSubmit, onSubmit, enabledCombinations])

  const content = (
    <Stack space={3}>
      <VariantSectionHeader count={combinations.length} />
      <Card border radius={2} padding={4}>
        <Stack space={4}>
          <SectionLabel>
            {componentT.default('productCreatorTool.combinations.options')}
          </SectionLabel>
          {loadingGroups ? (
            <Text size={1} muted>
              {componentT.default('productCreatorTool.combinations.loadingOptions')}
            </Text>
          ) : groups.length === 0 ? (
            <Text size={1} muted>
              {componentT.default('productCreatorTool.combinations.noOptionGroups')}
            </Text>
          ) : (
            <Stack space={5}>
              {groups.map((group) => (
                <Stack key={group._id} space={3}>
                  <Text size={1} weight="semibold">
                    {group.title}
                  </Text>
                  {group.options.length === 0 ? (
                    <Text size={1} muted>
                      {componentT.default('productCreatorTool.combinations.noOptions')}
                    </Text>
                  ) : (
                    <Flex wrap="wrap" gap={2}>
                      {group.options.map((option) => (
                        <OptionToggleCard
                          key={option._id}
                          groupId={group._id}
                          option={option}
                          checked={(selectedOptions[group._id] ?? []).includes(option._id)}
                          onToggle={toggleOption}
                        />
                      ))}
                    </Flex>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>
      {combinations.length > 0 && (
        <Stack space={3}>
          <Flex align="center" justify="space-between">
            <SectionLabel>
              {componentT.default(
                'productCreatorTool.combinations.preview',
                `Variants preview - ${enabledCombinations.length} of ${combinations.length}`,
                { enabledCount: enabledCombinations.length, totalCount: combinations.length },
              )}
            </SectionLabel>
            {showWarning && (
              <Card tone="caution" padding={2} radius={2} border>
                <Text size={1}>
                  {componentT.default(
                    'productCreatorTool.messages.combinations.warning',
                    `${enabledCombinations.length} variants - are you sure?`,
                  )}
                </Text>
              </Card>
            )}
          </Flex>

          <Stack space={2}>
            {combinations.map((combo, index) => {
              const label = combo.optionIds
                .map((optId, i) => {
                  const group = activeGroups[i]
                  return group?.options.find((o) => o._id === optId)?.title ?? optId
                })
                .join(' / ')

              return (
                <OptionComboCard
                  key={combo.id}
                  row={combo}
                  index={index}
                  label={label}
                  loadingTax={loadingTax}
                  taxCategories={taxCategories}
                  locales={props.global.locales}
                  defaultLocale={props.global.defaultLocale}
                  titlePlaceholder={props.global.titlePlaceholder}
                  onUpdate={updateCombination}
                  onToggleCombination={toggleCombination}
                />
              )
            })}
          </Stack>
        </Stack>
      )}
    </Stack>
  )

  return (
    <ProductTab
      global={props.global}
      submitting={submitting}
      rows={enabledCombinations.length}
      canSubmit={canSubmit}
      handleSubmit={handleSubmit}
      content={content}
      hideProductSection={props.hideProductSection}
    />
  )
}
