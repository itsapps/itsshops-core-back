import {
  Autocomplete,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Label,
  Select,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Text,
  TextInput,
  useToast,
} from '@sanity/ui'
import { ReactElement } from 'react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  AddIcon,
  CloseIcon,
  ProductKindBundleIcon,
  ProductKindDigitalIcon,
  ProductKindPhysicalIcon,
  ProductKindWineIcon,
} from '../../../assets/icons'
import { useITSContext } from '../../../context/ITSCoreProvider'
import { ProductKind, VinofactWine } from '../../../types'
import { WinePreview } from '../WinePreview'
import { I18nTitleInputs } from './I18nTitleField'
import { PriceField } from './PriceField'
import { GlobalDefaultsProps, MainProductProps, ProductTabProps } from './ProductCreator.types'
import { SectionLabel } from './SectionLabel'
import { TaxCategoryField } from './TaxCategoryField'

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
    <Card border radius={2} padding={4}>
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
