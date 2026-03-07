import { ComponentType } from 'react'

import { Country } from './constants'
import { Language } from './localization'
import {
  ITSDocumentDefinition,
  ITSSchemaDefinition,
  ITSStructureItem,
  SchemaExtension,
} from './schema'
import { RecursivePartial } from './utils'

export type AllowedDocumentReferenceType =
  | 'productVariant'
  | 'page'
  | 'post'
  | 'category'
  | 'blog'
  | string
export type AllowedDocumentReferenceTypes = AllowedDocumentReferenceType[]

export type ProductKind = 'wine' | 'physical' | 'digital' | 'bundle'
export type ProductKinds = ProductKind[]

export interface ITSCoreSchemaSettings {
  links: {
    allowedReferences: AllowedDocumentReferenceTypes
  }
  menus: {
    allowedReferences: AllowedDocumentReferenceTypes
    disableSubmenus: boolean
    maxDepth: number
  }
  productKinds: ProductKinds
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

export interface ItsConfigSettings {
  isDev: boolean
  ignoreExtensions: boolean
}
export type ConfigSettings = Partial<ItsConfigSettings>

export interface ItsshopsConfig {
  projectId: string
  dataset: string
  workspaceName: string
  workspaceIcon?: ComponentType
  settings: ConfigSettings
  integrations: IntegrationsConfig
  i18n?: I18nConfig
  features?: FeatureConfig
  schemaSettings?: SchemaSettingsInput
  schemaExtensions?: Record<string, SchemaExtension>
  documents?: ITSDocumentDefinition[]
  objects?: ITSSchemaDefinition[]
  structure?: ITSStructureItem[]
}

/** Internal version of the config used by the engine **/
export interface CoreBackConfig {
  projectId: string
  dataset: string
  workspaceName: string
  workspaceIcon?: ComponentType
  apiVersion: string
  isDev: boolean
  settings: ItsConfigSettings
  integrations: IntegrationsConfig
  localization: ITSi18nConfig
  features: ITSFeatureConfig
  schemaSettings: CoreSchemaSettings
  schemaExtensions: Record<string, SchemaExtension>
  documents: ITSDocumentDefinition[]
  objects: ITSSchemaDefinition[]
  structure: ITSStructureItem[]
}
