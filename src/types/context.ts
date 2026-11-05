import { type SanityClient, TFunction } from 'sanity'

import { CoreBackConfig } from './config'
import { CountryOption, VolumeOption } from './constants'
import { ITSFrontendClient } from './frontend'
import { ITSFormatter, ITSLocalizer, ITSTranslator } from './localization'
import { ITSFeatureRegistry } from './registry'
import { CoreFactory, FieldFactory, ITSBuilders } from './schema'
import { ITSImageBuilder } from './utils'
import { ITSVinofactClient } from './vinofact'

export interface ITSContext {
  config: CoreBackConfig
  featureRegistry: ITSFeatureRegistry
  locale: string
  localizer: ITSLocalizer
  format: ITSFormatter
  constants: {
    /** The shop's countries (delivery, tax, shop address). */
    countryOptions: CountryOption[]
    /** Every ISO country — for addresses where a person lives (customer account). */
    allCountryOptions: CountryOption[]
    volumeOptions: VolumeOption[]
  }
  i18nFieldTypes: Record<string, string>
  t: ITSTranslator //same as schemaT
  schemaT: ITSTranslator
  structureT: ITSTranslator
  componentT: ITSTranslator
}

export interface ITSProviderContext extends ITSContext {
  studioT: TFunction
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
