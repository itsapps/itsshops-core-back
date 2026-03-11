import { Card, Grid, Stack } from '@sanity/ui'
import { ReactElement } from 'react'

import { useITSContext } from '../../../context/ITSCoreProvider'
import { I18nTitleInputs } from './fields/I18nTitleField'
import { PriceField } from './fields/PriceField'
import { SectionLabel } from './fields/SectionLabel'
import { TaxCategoryField } from './fields/TaxCategoryField'
import { WeightField } from './fields/WeightField'
import { GlobalDefaultsProps, MainProductProps } from './ProductCreator.types'

export function GlobalDefaults(props: GlobalDefaultsProps): ReactElement {
  const {
    kind,
    globalPrice,
    globalTaxCategoryId,
    taxCategories,
    loadingTax,
    globalWeight,
    onPriceChange,
    onTaxChange,
    onWeightChange,
  } = props

  return (
    <Stack space={4}>
      <Grid columns={kind === 'physical' ? 3 : 2} gap={3}>
        <PriceField value={globalPrice} onChange={onPriceChange} required />
        <TaxCategoryField
          value={globalTaxCategoryId}
          taxCategories={taxCategories}
          loadingTax={loadingTax}
          onTaxChange={onTaxChange}
          required
        />
        {kind === 'physical' && <WeightField value={globalWeight} onChange={onWeightChange} />}
      </Grid>
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
    globalWeight,
    locales,
    defaultLocale,
    onTitlesChange,
    onGlobalPriceChange,
    onGlobalTaxChange,
    onGlobalWeightChange,
  } = props
  const { schemaT } = useITSContext()

  return (
    <Card
      border
      radius={2}
      padding={4}
      style={{ borderLeft: '3px solid var(--card-focus-ring-color)' }}
    >
      <Stack space={4}>
        <SectionLabel>{schemaT.default('product.title')}</SectionLabel>
        <I18nTitleInputs
          locales={locales}
          defaultLocale={defaultLocale}
          requiredLocales={[defaultLocale]}
          required
          titles={titles}
          onChange={onTitlesChange}
          placeholder={titlePlaceholder}
        />

        {/* Global defaults */}
        <GlobalDefaults
          kind={kind}
          globalPrice={globalPrice}
          globalTaxCategoryId={globalTaxCategoryId}
          taxCategories={taxCategories}
          loadingTax={loadingTax}
          globalWeight={globalWeight}
          onPriceChange={onGlobalPriceChange}
          onTaxChange={onGlobalTaxChange}
          onWeightChange={onGlobalWeightChange}
        />
      </Stack>
    </Card>
  )
}
