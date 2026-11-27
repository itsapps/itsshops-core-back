import { Card, Grid, Stack } from '@sanity/ui'
import { ReactElement } from 'react'

import { useITSContext } from '../../../context/ITSCoreProvider'
import { AdvancedSection } from './fields/AdvancedSection'
import { ChoiceFieldset } from './fields/ChoiceFieldset'
import { I18nTitleInputs } from './fields/I18nTitleField'
import { PriceField } from './fields/PriceField'
import { SectionHeading } from './fields/SectionHeading'
import { TaxCategoryField } from './fields/TaxCategoryField'
import { WeightField } from './fields/WeightField'
import { GlobalDefaultsProps, MainProductProps, TaxCategory } from './ProductCreator.types'

/** "Leer = Shop-Standard: 20 % Wein (wine)" — or that the shop has none. */
export function shopDefaultTaxHint(
  componentT: ReturnType<typeof useITSContext>['componentT'],
  taxCategories: TaxCategory[],
  shopDefaultTaxCategoryId: string | undefined,
): string {
  const tc = shopDefaultTaxCategoryId
    ? taxCategories.find((t) => t._id === shopDefaultTaxCategoryId)
    : undefined
  return tc
    ? componentT.default('productCreatorTool.tax.shopDefault', undefined, {
        title: `${tc.title} (${tc.code})`,
      })
    : componentT.default('productCreatorTool.tax.noShopDefault')
}

export function GlobalDefaults(props: GlobalDefaultsProps): ReactElement {
  const {
    kind,
    globalPrice,
    globalTaxCategoryId,
    taxCategories,
    loadingTax,
    shopDefaultTaxCategoryId,
    globalWeight,
    manufacturerChoices,
    onPriceChange,
    onTaxChange,
    onWeightChange,
  } = props

  const { componentT, schemaT } = useITSContext()
  // A bundle is taxed by its items — no tax category to pick (see BundleTab's price hint).
  const showTax = kind !== 'bundle'
  const columns = 1 + (kind === 'physical' ? 1 : 0)

  return (
    <Stack gap={4}>
      <Grid gridTemplateColumns={[1, 1, columns]} gap={3}>
        <PriceField value={globalPrice} onChange={onPriceChange} />
        {kind === 'physical' && <WeightField value={globalWeight} onChange={onWeightChange} />}
      </Grid>
      {(showTax || manufacturerChoices) && (
        <AdvancedSection
          setCount={(globalTaxCategoryId ? 1 : 0) + (manufacturerChoices?.selected.length ? 1 : 0)}
        >
          <Stack gap={4}>
            {/* Empty = not written: the product follows the shop default (also a later change) */}
            {showTax && (
              <TaxCategoryField
                value={globalTaxCategoryId}
                taxCategories={taxCategories}
                loadingTax={loadingTax}
                onTaxChange={onTaxChange}
                hint={shopDefaultTaxHint(componentT, taxCategories, shopDefaultTaxCategoryId)}
              />
            )}
            {/* Most wine shops are their own producer — hence under "Advanced" */}
            {manufacturerChoices && manufacturerChoices.options.length > 0 && (
              <ChoiceFieldset
                legend={schemaT.default('fields.manufacturers.title')}
                group={manufacturerChoices}
              />
            )}
          </Stack>
        </AdvancedSection>
      )}
    </Stack>
  )
}

export function MainProduct(props: MainProductProps): ReactElement {
  const {
    kind,
    titlePlaceholder,
    titles,
    globalPrice,
    globalTaxCategoryId,
    taxCategories,
    loadingTax,
    shopDefaultTaxCategoryId,
    globalWeight,
    locales,
    defaultLocale,
    onTitlesChange,
    onGlobalPriceChange,
    onGlobalTaxChange,
    onGlobalWeightChange,
    titleHint,
    titleAction,
    titleInputId,
    categoryChoices,
    manufacturerChoices,
  } = props
  const { schemaT, componentT } = useITSContext()

  return (
    <Card
      border
      radius={2}
      padding={4}
      style={{ borderLeft: '3px solid var(--card-focus-ring-color)' }}
    >
      <Stack gap={4}>
        {/* What this card is for: shared by every variant (the wine tab says "Wein") */}
        <SectionHeading
          title={componentT.default(
            kind === 'wine'
              ? 'productCreatorTool.productSection.titleWine'
              : 'productCreatorTool.productSection.title',
          )}
          description={componentT.default(
            kind === 'wine'
              ? 'productCreatorTool.productSection.descriptionWine'
              : 'productCreatorTool.productSection.description',
          )}
        />
        <I18nTitleInputs
          locales={locales}
          defaultLocale={defaultLocale}
          requiredLocales={[defaultLocale]}
          required
          titles={titles}
          onChange={onTitlesChange}
          placeholder={titlePlaceholder}
          hint={titleHint}
          action={titleAction}
          defaultInputId={titleInputId}
        />

        {/* Product level only: a variant's categories would replace the product's */}
        {categoryChoices && categoryChoices.options.length > 0 && (
          <ChoiceFieldset
            legend={schemaT.default('fields.categories.title')}
            group={categoryChoices}
          />
        )}

        {/* Global defaults */}
        <GlobalDefaults
          kind={kind}
          globalPrice={globalPrice}
          globalTaxCategoryId={globalTaxCategoryId}
          taxCategories={taxCategories}
          loadingTax={loadingTax}
          shopDefaultTaxCategoryId={shopDefaultTaxCategoryId}
          globalWeight={globalWeight}
          manufacturerChoices={manufacturerChoices}
          onPriceChange={onGlobalPriceChange}
          onTaxChange={onGlobalTaxChange}
          onWeightChange={onGlobalWeightChange}
        />
      </Stack>
    </Card>
  )
}
