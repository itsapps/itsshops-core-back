import { ComponentType } from 'react'

import { Country } from './country'
import { Language } from './localization'
import {
  ITSDocumentDefinition,
  ITSSchemaDefinition,
  ITSStructureItem,
  SchemaExtension,
} from './schema'
import { RecursivePartial } from './utils'

export interface ITSCoreSchemaSettings {
  links: {
    allowedReferences: string[]
  }
  menus: {
    allowedReferences: string[]
    disableSubmenus: boolean
    maxDepth: number
  }
}
export type CoreSchemaSettings = ITSCoreSchemaSettings
export type SchemaSettingsInput = RecursivePartial<CoreSchemaSettings>

export interface VinofactConfig {
  enabled: boolean
  integration?: {
    endpoint: string
    accessToken: string
    profileSlug: string
  }
}

export interface FeatureConfig {
  shop?: Partial<{
    enabled: boolean
    manufacturer?: boolean
    stock?: boolean
    category?: boolean
    vinofact?: VinofactConfig
  }>
  blog?: boolean
  users?: boolean
}

export interface ITSFeatureConfig {
  shop: {
    enabled: boolean
    manufacturer: boolean
    stock: boolean
    category: boolean
    vinofact: VinofactConfig
  }
  blog: boolean
  users: boolean
}

export interface I18nConfig {
  ui?: string[]
  fields?: string[]
  defaultLocale?: string
  fieldTranslationOverrides?: Record<string, any>
  structureTranslationOverrides?: Record<string, any>
  translationOverrides?: Record<string, any>
  localizedFieldTypes?: string[]
}

export interface ITSi18nConfig {
  uiLanguages: Language[]
  fieldLanguages: Language[]
  uiLocales: string[]
  fieldLocales: string[]
  defaultLocale: string
  localizedFieldTypes: string[]
  overrides: {
    fields: Record<string, any>
    structure: Record<string, any>
    general: Record<string, any>
  }
  countries: Country[]
}

export interface NetlifyConfig {
  accessToken: string
  siteId: string
  projectName: string
  endpoint: string
  secret: string
}
export interface IntegrationsConfig {
  netlify: NetlifyConfig
}

export interface ItsshopsConfig {
  isDev: boolean
  projectId: string
  dataset: string
  workspaceName: string
  workspaceIcon?: ComponentType
  i18n?: I18nConfig
  features?: FeatureConfig
  integrations: IntegrationsConfig
  schemaSettings?: SchemaSettingsInput
  schemaExtensions?: Record<string, SchemaExtension>
  documents?: ITSDocumentDefinition[]
  objects?: ITSSchemaDefinition[]
  structure?: ITSStructureItem[]
}

/** Internal version of the config used by the engine **/
export interface CoreBackConfig extends Omit<ItsshopsConfig, 'features' | 'schemaSettings'> {
  localization: ITSi18nConfig
  features: ITSFeatureConfig
  schemaSettings: CoreSchemaSettings
  apiVersion: string
}
