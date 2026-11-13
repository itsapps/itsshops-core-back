import type { DocumentActionComponent, DocumentActionsContext } from 'sanity'
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
  'productVariant' | 'page' | 'post' | 'category' | 'blog' | string
export type AllowedDocumentReferenceTypes = AllowedDocumentReferenceType[]

export type ProductKind = 'wine' | 'physical' | 'digital' | 'bundle'
export type ProductKinds = ProductKind[]

export interface ITSCoreSchemaSettings {
  links: {
    allowedReferences: AllowedDocumentReferenceTypes
  }
  menus: {
    allowedReferences: AllowedDocumentReferenceTypes
    /** Menu levels, top level included: 1 = flat (default), 2 = top-level links + submenus of links. */
    maxDepth: number
  }
  productKinds: ProductKinds
}
export type CoreSchemaSettings = ITSCoreSchemaSettings
export type SchemaSettingsInput = RecursivePartial<CoreSchemaSettings>

export interface VinofactConfig {
  enabled: boolean
}

/** Public values only — the API token lives in the secrets document (`integrations.vinofactToken`). */
export interface VinofactIntegrationConfig {
  endpoint: string
  profileSlug: string
}

export interface FeatureConfig {
  shop?: Partial<{
    enabled: boolean
    /** Online checkout (default true). Off hides the checkout-only shop settings. */
    checkout?: boolean
    manufacturer?: boolean
    stock?: boolean
    category?: boolean | { subcategories?: boolean }
    vinofact?: VinofactConfig
    vouchers?: boolean
    coupons?: boolean
    /** Variants can make the whole order ship free (`grantsFreeShipping`). Needs checkout. Default false. */
    productFreeShipping?: boolean
    /**
     * Core issues invoices (default true). `false` when another system issues them (e.g.
     * wineNET): the "Send mail" action offers no invoice mail and no PDF attachment. Pair with
     * core-front's notify wrapper option `invoices: false`.
     */
    invoices?: boolean
  }>
  blog?: boolean
  users?: boolean
  newsletter?: boolean
}

export interface ITSFeatureConfig {
  shop: {
    enabled: boolean
    checkout: boolean
    manufacturer: boolean
    stock: boolean
    category: boolean | { subcategories?: boolean }
    vinofact: VinofactConfig
    vouchers: boolean
    coupons: boolean
    productFreeShipping: boolean
    invoices: boolean
  }
  blog: boolean
  users: boolean
  newsletter: boolean
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
    components: Record<string, any>
  }
  countries: Country[]
}

/**
 * Public values only. Everything in `SANITY_STUDIO_*` and `sanity.config.ts` is compiled into the
 * Studio bundle, which anyone can download — credentials go into the secrets document
 * (`@sanity/studio-secrets`, namespace `itsshops`, Integrations dialog).
 */
export interface NetlifyConfig {
  /** The core-front frontend's Netlify site id (deploy-status badge). */
  siteId: string
  /** Netlify project name ("Open in Netlify" link). */
  projectName: string
  /** Public URL of the deployed core-front (server functions). */
  endpoint: string
}

export interface IntegrationsConfig {
  // The customer's deployed core-front. `endpoint` is the public URL; Studio document actions
  // (refund, notify) call /api/* paths under it with the `functionsSecret` from the secrets
  // document, which must match SERVER_FUNCTIONS_SECRET in the core-front Netlify env.
  netlify: NetlifyConfig
  vinofact?: VinofactIntegrationConfig
}

export interface ItsConfigSettings {
  isDev: boolean
  ignoreExtensions: boolean
}
export type ConfigSettings = Partial<ItsConfigSettings>

export interface ItsshopsConfig {
  projectId?: string
  dataset?: string
  workspaceName?: string
  workspaceIcon?: ComponentType
  settings: ConfigSettings
  integrations?: { vinofact?: VinofactIntegrationConfig }
  i18n?: I18nConfig
  features?: FeatureConfig
  schemaSettings?: SchemaSettingsInput
  schemaExtensions?: Record<string, SchemaExtension>
  documents?: ITSDocumentDefinition[]
  objects?: ITSSchemaDefinition[]
  structure?: ITSStructureItem[]
  /** Customer hook to add/wrap document actions (e.g. withGeneratedZips). Runs after core's own resolver. */
  documentActions?: DocumentActionResolver
}

/** Transforms the resolved document actions for a document. */
export type DocumentActionResolver = (
  actions: DocumentActionComponent[],
  context: DocumentActionsContext,
) => DocumentActionComponent[]

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
  documentActions?: DocumentActionResolver
}
