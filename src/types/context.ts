import { type SanityClient, TFunction } from 'sanity'

import { CoreBackConfig } from './config'
import { CountryOption } from './country'
import { ITSFrontendClient } from './frontend'
import { ITSFormatter, ITSLocalizer, ITSTranslator } from './localization'
import { ITSFeatureRegistry } from './registry'
import { CoreFactory, FieldFactory, ITSBuilders } from './schema'
import { ITSImageBuilder } from './utils'
import { ITSVinofactClient } from './vinofact'

export interface ITSLocaleContext {
  config: CoreBackConfig
  featureRegistry: ITSFeatureRegistry
  locale: string
  localizer: ITSLocalizer
  format: ITSFormatter
  countryOptions: CountryOption[]
  i18nFieldTypes: Record<string, string>
  schemaT: ITSTranslator
  structureT: ITSTranslator
}
export interface ITSContext extends ITSLocaleContext {
  t: ITSTranslator
}

export interface ITSProviderContext extends ITSLocaleContext {
  t: TFunction
  sanityClient: SanityClient
  imageBuilder: ITSImageBuilder
  frontendClient: ITSFrontendClient
  vinofactClient?: ITSVinofactClient
}

export interface FieldContext extends ITSContext {
  f: FieldFactory
  builders: ITSBuilders
  factory: CoreFactory
}
