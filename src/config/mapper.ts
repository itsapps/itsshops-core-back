import {
  AllowedDocumentReferenceTypes,
  CoreBackConfig,
  FeatureConfig,
  ITSCoreSchemaSettings,
  ITSFeatureConfig,
  ItsshopsConfig,
  ProductKinds,
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
const allowedProductKinds: ProductKinds = ['wine', 'physical', 'digital', 'bundle']

// eslint-disable-next-line complexity
export const mapConfig = (config: ItsshopsConfig): CoreBackConfig => {
  const isDev = config.settings.isDev || false
  const ignoreExtensions = config.settings.ignoreExtensions || false

  const projectId = config.projectId ?? process.env.SANITY_STUDIO_PROJECT ?? ''
  const dataset = config.dataset ?? process.env.SANITY_STUDIO_DATASET ?? ''
  const workspaceName = config.workspaceName ?? process.env.SANITY_STUDIO_WORKSPACE_NAME ?? ''

  const { uiLanguages, fieldLanguages, uiLocales, fieldLocales } = getLanguages(config.i18n)
  const defaultLocale = config.i18n?.defaultLocale || uiLocales?.[0] || 'en'
  const localizedFieldTypes = ignoreExtensions
    ? i18nFieldTypes
    : [...i18nFieldTypes, ...(config.i18n?.localizedFieldTypes || [])]

  const features = ignoreExtensions ? allFeatures() : normalizeFeatures(config.features)

  const coreSchemaSettings: ITSCoreSchemaSettings = {
    links: { allowedReferences: allowedDocumentReferenceTypes },
    menus: {
      disableSubmenus: false,
      maxDepth: 1,
      allowedReferences: allowedDocumentReferenceTypes,
    },
    productKinds: allowedProductKinds,
  }
  const schemaSettings = ignoreExtensions
    ? coreSchemaSettings
    : deepMerge(coreSchemaSettings, config.schemaSettings || {})

  if (features?.shop?.enabled && schemaSettings.productKinds.length === 0) {
    throw new Error('At least one productKind is required in schemaSettings')
  }

  const overrides = ignoreExtensions
    ? {
        fields: {},
        structure: {},
        components: {},
      }
    : {
        fields: config.i18n?.fieldTranslationOverrides || {},
        structure: config.i18n?.structureTranslationOverrides || {},
        components: config.i18n?.translationOverrides || {},
      }

  const schemaExtensions = ignoreExtensions ? {} : config.schemaExtensions || {}

  const countries = createCountries(uiLocales)

  const netlify = {
    accessToken: process.env.SANITY_STUDIO_NETLIFY_ACCESS_TOKEN ?? '',
    siteId: process.env.SANITY_STUDIO_NETLIFY_SITE_ID ?? '',
    projectName: process.env.SANITY_STUDIO_NETLIFY_PROJECT_NAME ?? '',
    endpoint: process.env.SANITY_STUDIO_NETLIFY_FUNCTIONS_ENDPOINT ?? '',
    secret: process.env.SANITY_STUDIO_NETLIFY_FUNCTIONS_SECRET ?? '',
  }

  const vinofact = features.shop.vinofact.enabled
    ? (config.integrations?.vinofact ?? {
        endpoint: process.env.SANITY_STUDIO_VINOFACT_API_URL ?? '',
        accessToken: process.env.SANITY_STUDIO_VINOFACT_API_TOKEN ?? '',
        profileSlug: process.env.SANITY_STUDIO_VINOFACT_PROFILE_SLUG ?? '',
      })
    : undefined

  return {
    // ...config,
    projectId,
    dataset,
    workspaceName,
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
    integrations: { netlify, vinofact },
    schemaSettings,
    schemaExtensions,
    apiVersion: sanityApiVersion,
    documents: ignoreExtensions ? [] : config.documents || [],
    objects: ignoreExtensions ? [] : config.objects || [],
    structure: ignoreExtensions ? [] : config.structure || [],
  }
}

function allFeatures(): ITSFeatureConfig {
  return {
    shop: {
      enabled: true,
      manufacturer: true,
      stock: true,
      category: { subcategories: true },
      vinofact: {
        enabled: true,
      },
      vouchers: true,
      coupons: true,
    },
    blog: true,
    users: true,
  } as ITSFeatureConfig
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
      vouchers: input?.shop?.vouchers ?? false,
      coupons: input?.shop?.coupons ?? false,
    },
    blog: input?.blog ?? false,
    users: input?.users ?? false,
  } as ITSFeatureConfig
}
