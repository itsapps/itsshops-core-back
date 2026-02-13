import { ItsshopsConfig, CoreBackConfig, ITSCoreSchemaSettings, FeatureConfig, ITSFeatureConfig } from '../types';
import { getLanguages } from '../localization'; // Assuming this helper exists
import { deepMerge } from '../utils';
import { createCountries } from './countries';

const sanityApiVersion = 'v2025-05-25';
const allowedDocumentReferenceTypes = ['product', 'productVariant', 'page', 'post', 'category', 'blog'];
const localizedFieldTypes = [ 'string', 'url', 'text', 'slug', 'cropImage', 'baseImage', 'localeImage', 'localeTextsImage', 'textBlock' ];

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
      localizedFieldTypes: [...localizedFieldTypes, ...config.i18n?.localizedFieldTypes || []],
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
      category: input?.shop?.category ?? false,
      vinofact: input?.shop?.vinofact ?? {
        enabled: false,
      },
    },
    blog: input?.blog ?? false,
    users: input?.users ?? false,
  }
}

// const localizedFieldTypes = [
//     'string',
//     'text',
//     'slug',
//     // 'cropImage',
//     // 'localeImage',
//     'baseImage',
//     'localeTextsImage',
//     // 'image',
//     // 'array',
//     // 'customImage',
//     // 'complexPortableText',
//     // {
//     //   name: 'cropImage', // This is the base type
//     //   type: 'image',
//     //   options: { layout: 'grid' },
//     //   // of: [
//     //   //   { type: 'localeImage' }, 
//     //   // ]
//     // },
//     // {
//     //   name: 'customImages', // This is the base type
//     //   type: 'array',
//     //   of: [
//     //     { type: 'customImage' }, 
//     //   ]
//     // },
//     // {
//     //   name: 'porti', // This is the base type
//     //   type: 'array',
//     //   of: [
//     //     { type: 'complexPortableText' }, 
//     //   ]
//     // },
//   ]