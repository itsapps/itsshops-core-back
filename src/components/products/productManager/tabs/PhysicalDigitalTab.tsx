/* eslint-disable max-nested-callbacks */
/* eslint-disable no-nested-ternary */
import { Badge, Box, Card, Flex, Grid, Stack, Text } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { ReactElement } from 'react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { CheckIcon } from '../../../../assets/icons'
import { useITSContext } from '../../../../context/ITSCoreProvider'
import { cartesian } from '../../../../lib/shop/productVariant.tx'
import { VariantOption, VariantOptionGroup } from '../../../../types'
import { uid } from '../../../../utils/utils'
import { AdvancedSection } from '../fields/AdvancedSection'
import { DuplicateNotice, useTitleDuplicates } from '../duplicates'
import { I18nTitleInputs } from '../fields/I18nTitleField'
import { inheritedPriceLabel, inheritedTaxLabel } from '../fields/inherited'
import { PriceField } from '../fields/PriceField'
import { SectionLabel } from '../fields/SectionLabel'
import { TaxCategoryField } from '../fields/TaxCategoryField'
import { VariantRow } from '../fields/VariantRow'
import { VariantSectionHeader } from '../fields/VariantSectionHeader'
import { WeightField } from '../fields/WeightField'
import {
  CombinationRow,
  I18nTitleEntry,
  OptionComboCardProps,
  OptionGroup,
  OptionToggleCardProps,
  PhysicalDigitalTabProps,
  SubmitCheck,
} from '../ProductCreator.types'
import { ProductTab } from './ProductTab'

/** "Rot / XL" — the option titles of a combination, in the order of the active groups. */
function comboLabel(combo: CombinationRow, activeGroups: OptionGroup[]): string {
  return combo.optionIds
    .map((optId, i) => activeGroups[i]?.options.find((o) => o._id === optId)?.title ?? optId)
    .join(' / ')
}

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
      weight: undefined,
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
      type="button"
      padding={2}
      radius={2}
      border
      tone={checked ? 'positive' : 'default'}
      onClick={handleClick}
      aria-pressed={checked}
      style={{ cursor: 'pointer' }}
    >
      {/* The check icon shows the state without relying on colour (WCAG 1.4.1) */}
      <Flex align="center" gap={2}>
        {checked && (
          <Text size={1}>
            <CheckIcon aria-hidden />
          </Text>
        )}
        <Text size={1}>{option.title}</Text>
      </Flex>
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
    showWeight,
    priceInherited,
    taxInherited,
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

  const handleWeightChange = useCallback(
    (value: number | undefined) => onUpdate(row.id, 'weight', value),
    [onUpdate, row.id],
  )

  return (
    <VariantRow
      index={index}
      tone={row.alreadyExists ? 'caution' : row.enabled ? 'default' : 'transparent'}
    >
      <Stack gap={3}>
        <Grid gridTemplateColumns={[1, 1, showWeight ? 3 : 2]} gap={3}>
          {/* Toggle + label */}
          <Flex align="center" gap={3} style={{ gridColumn: 'span 1' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75em',
                cursor: row.alreadyExists ? 'not-allowed' : 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={handleCombinationToggle}
                disabled={row.alreadyExists}
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
            </label>
            {row.alreadyExists && (
              <Badge tone="caution">
                {componentT.default('productCreatorTool.messages.variantExists')}
              </Badge>
            )}
          </Flex>

          {row.enabled && !row.alreadyExists && (
            <>
              <PriceField
                value={row.price}
                onChange={handlePriceChange}
                required={false}
                inheritedLabel={priceInherited}
              />
              {showWeight && <WeightField value={row.weight} onChange={handleWeightChange} />}
            </>
          )}
        </Grid>

        {row.enabled && !row.alreadyExists && (
          <Box>
            {/* Tax override — empty inherits the product's, then the shop default */}
            <AdvancedSection setCount={row.taxCategoryId ? 1 : 0}>
              <TaxCategoryField
                value={row.taxCategoryId}
                taxCategories={taxCategories}
                loadingTax={loadingTax}
                onTaxChange={handleTaxChange}
                inheritedLabel={taxInherited}
              />
            </AdvancedSection>
          </Box>
        )}

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
  const { globalTaxCategoryId, shopDefaultTaxCategoryId } = props.global
  const { onSubmit, submitting, existingOptionSets, hideProductSection, activeKind } = props
  const { sanityClient, localizer, componentT, format } = useITSContext()
  const toast = useToast()

  const [groups, setGroups] = useState<OptionGroup[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  // selectedOptions: groupId → array of selected optionIds
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [combinations, setCombinations] = useState<CombinationRow[]>([])

  // Load groups + options
  useEffect(() => {
    sanityClient
      .fetch<{
        groups: Pick<VariantOptionGroup, '_id' | 'title' | 'sortOrder'>[]
        options: (Pick<VariantOption, '_id' | 'title' | 'sortOrder'> & { groupId: string })[]
      }>(
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
          title: componentT.default('productCreatorTool.errors.loadOptionGroups'),
          description: err.message,
        })
      })
      .finally(() => setLoadingGroups(false))
  }, [sanityClient, localizer, toast, componentT])

  // Recompute combinations whenever selections change — always reset overrides
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset editable combinations when the selection changes
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

  const submitCheck = useMemo((): SubmitCheck => {
    const reasons: string[] = []
    if (!hideProductSection) {
      const defaultTitle = titles.find((ts) => ts.locale === defaultLocale)?.value
      if (!defaultTitle?.trim())
        reasons.push(componentT.default('productCreatorTool.reasons.title'))
    }
    if (enabledCombinations.length === 0) {
      reasons.push(componentT.default('productCreatorTool.reasons.noVariant'))
    }
    // Active variants need a price — the global (product) one or the row's (also when adding
    // variants to an existing product: `globalPrice` is then the product's price).
    if (!globalPrice) {
      const key = hideProductSection ? 'priceMissingExisting' : 'priceMissing'
      for (const combo of enabledCombinations.filter((c) => !c.price)) {
        reasons.push(
          componentT.default(`productCreatorTool.reasons.${key}`, undefined, {
            label: comboLabel(combo, activeGroups),
          }),
        )
      }
    }
    return { ok: reasons.length === 0, reasons }
  }, [
    hideProductSection,
    titles,
    defaultLocale,
    globalPrice,
    enabledCombinations,
    activeGroups,
    componentT,
  ])

  const handleSubmit = useCallback(async () => {
    if (!submitCheck.ok) return
    const ok = await onSubmit(enabledCombinations)
    if (!ok) return // keep the editor's selection after a failed commit
    setSelectedOptions({})
    setCombinations([])
  }, [submitCheck.ok, onSubmit, enabledCombinations])

  const duplicateLines = useTitleDuplicates(
    activeKind,
    titles.find((ts) => ts.locale === defaultLocale)?.value ?? '',
    !hideProductSection,
  )
  const priceInherited = inheritedPriceLabel(componentT, format, globalPrice)
  const taxInherited = inheritedTaxLabel(
    componentT,
    taxCategories,
    globalTaxCategoryId,
    shopDefaultTaxCategoryId,
  )

  const content = (
    <Stack gap={3}>
      <DuplicateNotice lines={duplicateLines} />
      <VariantSectionHeader count={combinations.length} />
      <Card border radius={2} padding={4}>
        <Stack gap={4}>
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
            <Stack gap={5}>
              {groups.map((group) => (
                <Stack key={group._id} gap={3}>
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
        <Stack gap={3}>
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

          <Stack gap={2}>
            {combinations.map((combo, index) => {
              return (
                <OptionComboCard
                  key={combo.id}
                  row={combo}
                  index={index}
                  label={comboLabel(combo, activeGroups)}
                  loadingTax={loadingTax}
                  taxCategories={taxCategories}
                  locales={props.global.locales}
                  defaultLocale={props.global.defaultLocale}
                  titlePlaceholder={props.global.titlePlaceholder}
                  showWeight={activeKind === 'physical'}
                  priceInherited={priceInherited}
                  taxInherited={taxInherited}
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
      submitCheck={submitCheck}
      handleSubmit={handleSubmit}
      content={content}
      hideProductSection={props.hideProductSection}
    />
  )
}
