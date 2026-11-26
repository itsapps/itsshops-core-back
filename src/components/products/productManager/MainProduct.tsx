import { Card, Grid, Stack } from '@sanity/ui'
import { ReactElement } from 'react'

import { useITSContext } from '../../../context/ITSCoreProvider'
import { AdvancedSection } from './fields/AdvancedSection'
import { I18nTitleInputs } from './fields/I18nTitleField'
import { PriceField } from './fields/PriceField'
import { SectionLabel } from './fields/SectionLabel'
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
    onPriceChange,
    onTaxChange,
    onWeightChange,
  } = props

  const { componentT } = useITSContext()
  // A bundle is taxed by its items — no tax category to pick (see BundleTab's price hint).
  const showTax = kind !== 'bundle'
  const columns = 1 + (kind === 'physical' ? 1 : 0)

  return (
    <Stack gap={4}>
      <Grid gridTemplateColumns={[1, 1, columns]} gap={3}>
        <PriceField value={globalPrice} onChange={onPriceChange} />
        {kind === 'physical' && <WeightField value={globalWeight} onChange={onWeightChange} />}
      </Grid>
      {/* Empty = not written: the product follows the shop default (also a later change of it) */}
      {showTax && (
        <AdvancedSection setCount={globalTaxCategoryId ? 1 : 0}>
          <TaxCategoryField
            value={globalTaxCategoryId}
            taxCategories={taxCategories}
            loadingTax={loadingTax}
            onTaxChange={onTaxChange}
            hint={shopDefaultTaxHint(componentT, taxCategories, shopDefaultTaxCategoryId)}
          />
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
        {/* The wine tab speaks of "Wein", not "Produkt" */}
        <SectionLabel>
          {kind === 'wine'
            ? componentT.default('productCreatorTool.wine.product')
            : schemaT.default('product.title')}
        </SectionLabel>
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
        />

        {/* Global defaults */}
        <GlobalDefaults
          kind={kind}
          globalPrice={globalPrice}
          globalTaxCategoryId={globalTaxCategoryId}
          taxCategories={taxCategories}
          loadingTax={loadingTax}
          shopDefaultTaxCategoryId={shopDefaultTaxCategoryId}
          globalWeight={globalWeight}
          onPriceChange={onGlobalPriceChange}
          onTaxChange={onGlobalTaxChange}
          onWeightChange={onGlobalWeightChange}
        />
      </Stack>
    </Card>
  )
}
