import { ItsshopsConfig, CoreBackConfig, ITSCoreSchemaSettings, FeatureConfig, ITSFeatureConfig } from '../types';
import { getLanguages } from './localization'; // Assuming this helper exists
import { deepMerge } from '../utils';
import { createCountries } from './countries';
import { i18nFieldTypes } from './fieldTypes';

const sanityApiVersion = 'v2025-05-25';
const allowedDocumentReferenceTypes = ['product', 'productVariant', 'page', 'post', 'category', 'blog'];

export const mapConfig = (config: ItsshopsConfig): CoreBackConfig => {
  const { uiLanguages, fieldLanguages, uiLocales, fieldLocales } = getLanguages(config.i18n);

  const features = normalizeFeatures(config.features)
  
  const coreSchemaSettings: ITSCoreSchemaSettings = {
    links: { allowedReferences: allowedDocumentReferenceTypes },
    menus: { disableSubmenus: false, maxDepth: 1, allowedReferences: allowedDocumentReferenceTypes }
  };
  const schemaSettings = deepMerge(coreSchemaSettings, config.schemaSettings || {});

  const countries = createCountries(uiLocales)

  return {
    ...config,
    localization: {
      uiLanguages,
      fieldLanguages,
      uiLocales,
      fieldLocales,
      defaultLocale: config.i18n?.defaultLocale || uiLocales?.[0] || 'en',
      localizedFieldTypes: [...i18nFieldTypes, ...config.i18n?.localizedFieldTypes || []],
      overrides: {
        fields: config.i18n?.fieldTranslationOverrides || {},
        structure: config.i18n?.structureTranslationOverrides || {},
        general: config.i18n?.translationOverrides || {},
      },
      countries
    },
    features,
    schemaSettings,
    schemaExtensions: config.schemaExtensions || {},
    apiVersion: sanityApiVersion,
  };
};

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