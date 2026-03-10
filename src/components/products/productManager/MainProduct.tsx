import { Card, Grid, Stack } from '@sanity/ui'
import { ReactElement } from 'react'

import { useITSContext } from '../../../context/ITSCoreProvider'
import { I18nTitleInputs } from './fields/I18nTitleField'
import { PriceField } from './fields/PriceField'
import { SectionLabel } from './fields/SectionLabel'
import { TaxCategoryField } from './fields/TaxCategoryField'
import { GlobalDefaultsProps, MainProductProps } from './ProductCreator.types'

export function GlobalDefaults(props: GlobalDefaultsProps): ReactElement {
  const {
    globalPrice,
    globalTaxCategoryId,
    taxCategories,
    loadingTax,
    onPriceChange,
    onTaxChange,
  } = props

  return (
    <Stack space={4}>
      <Grid columns={2} gap={3}>
        <PriceField value={globalPrice} onChange={onPriceChange} required />
        <TaxCategoryField
          value={globalTaxCategoryId}
          taxCategories={taxCategories}
          loadingTax={loadingTax}
          onTaxChange={onTaxChange}
          required
        />
      </Grid>
    </Stack>
  )
}

export function MainProduct(props: MainProductProps): ReactElement {
  const {
    titlePlaceholder,
    titles,
    globalPrice,
    globalTaxCategoryId,
    taxCategories,
    loadingTax,
    locales,
    defaultLocale,
    onTitlesChange,
    onGlobalPriceChange,
    onGlobalTaxChange,
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
          globalPrice={globalPrice}
          globalTaxCategoryId={globalTaxCategoryId}
          taxCategories={taxCategories}
          loadingTax={loadingTax}
          onPriceChange={onGlobalPriceChange}
          onTaxChange={onGlobalTaxChange}
        />
      </Stack>
    </Card>
  )
}
