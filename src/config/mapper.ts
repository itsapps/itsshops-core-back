import {
  AllowedDocumentReferenceTypes,
  CoreBackConfig,
  FeatureConfig,
  ITSCoreSchemaSettings,
  ITSFeatureConfig,
  ItsshopsConfig,
} from '../types'
import { deepMerge } from '../utils'
import { createCountries } from './constants/countries'
import { i18nFieldTypes } from './fieldTypes'
import { getLanguages } from './localization'

const sanityApiVersion = 'v2025-05-25'
const allowedDocumentReferenceTypes: AllowedDocumentReferenceTypes = [
  'productVariant',
  'page',
  'post',
  'category',
  'blog',
]

export const mapConfig = (config: ItsshopsConfig): CoreBackConfig => {
  const isDev = config.settings.isDev || false
  const ignoreExtensions = config.settings.ignoreExtensions || false

  const { uiLanguages, fieldLanguages, uiLocales, fieldLocales } = getLanguages(config.i18n)
  const defaultLocale = config.i18n?.defaultLocale || uiLocales?.[0] || 'en'
  const localizedFieldTypes = ignoreExtensions
    ? i18nFieldTypes
    : [...i18nFieldTypes, ...(config.i18n?.localizedFieldTypes || [])]

  const features = normalizeFeatures(config.features)

  const coreSchemaSettings: ITSCoreSchemaSettings = {
    links: { allowedReferences: allowedDocumentReferenceTypes },
    menus: {
      disableSubmenus: false,
      maxDepth: 1,
      allowedReferences: allowedDocumentReferenceTypes,
    },
  }
  const schemaSettings = ignoreExtensions
    ? coreSchemaSettings
    : deepMerge(coreSchemaSettings, config.schemaSettings || {})

  const overrides = ignoreExtensions
    ? {
        fields: {},
        structure: {},
        general: {},
      }
    : {
        fields: config.i18n?.fieldTranslationOverrides || {},
        structure: config.i18n?.structureTranslationOverrides || {},
        general: config.i18n?.translationOverrides || {},
      }

  const schemaExtensions = ignoreExtensions ? {} : config.schemaExtensions || {}

  const countries = createCountries(uiLocales)

  return {
    // ...config,
    projectId: config.projectId,
    dataset: config.dataset,
    workspaceName: config.workspaceName,
    workspaceIcon: config.workspaceIcon,
    isDev,
    settings: {
      isDev,
      ignoreExtensions,
    },
    localization: {
      uiLanguages,
      fieldLanguages,
      uiLocales,
      fieldLocales,
      defaultLocale,
      localizedFieldTypes,
      overrides,
      countries,
    },
    features,
    integrations: config.integrations,
    schemaSettings,
    schemaExtensions,
    apiVersion: sanityApiVersion,
    productKinds: ['wine', 'physical', 'digital', 'bundle'],
    documents: config.documents || [],
    objects: config.objects || [],
    structure: config.structure || [],
  }
}

function normalizeFeatures(input?: FeatureConfig): ITSFeatureConfig {
  return {
    shop: {
      enabled: input?.shop?.enabled ?? false,
      manufacturer: input?.shop?.manufacturer ?? false,
      stock: input?.shop?.stock ?? false,
      category: input?.shop?.category ?? false,
      vinofact: input?.shop?.vinofact ?? {
        enabled: false,
      },
    },
    blog: input?.blog ?? false,
    users: input?.users ?? false,
  }
}
