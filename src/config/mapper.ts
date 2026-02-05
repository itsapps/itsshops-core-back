import { ItsshopsConfig, CoreBackConfig, ITSCoreSchemaSettings, FeatureConfig, ITSFeatureConfig } from '../types';
import { getLanguages } from '../localization'; // Assuming this helper exists
import { deepMerge } from '../utils';

const sanityApiVersion = 'v2025-05-25';
const allowedDocumentReferenceTypes = ['product', 'productVariant', 'page', 'post', 'category', 'blog'];
const localizedFieldTypes = [ 'string', 'text', 'slug', 'baseImage', 'localeTextsImage', 'textBlock' ];

const countryOptions = [
  { title: { en: 'Austria', de: 'Österreich' }, value: 'AT' },
  { title: { en: 'Germany', de: 'Deutschland' }, value: 'DE' },
  { title: { en: 'Switzerland', de: 'Schweiz' }, value: 'CH' },
  { title: { en: 'Italy', de: 'Italien' }, value: 'IT' },
  { title: { en: 'Belgium', de: 'Belgien' }, value: 'BE' },
  { title: { en: 'Denmark', de: 'Dänemark' }, value: 'DK' },
  { title: { en: 'Spain', de: 'Spanien' }, value: 'ES' },
  { title: { en: 'Finland', de: 'Finnland' }, value: 'FI' },
  { title: { en: 'France', de: 'Frankreich' }, value: 'FR' },
  { title: { en: 'United Kingdom', de: 'Großbritannien' }, value: 'GB' },
  { title: { en: 'Ireland', de: 'Irland' }, value: 'IE' },
  { title: { en: 'Netherlands', de: 'Niederlande' }, value: 'NL' },
  { title: { en: 'Norway', de: 'Norwegen' }, value: 'NO' },
  { title: { en: 'Poland', de: 'Polen' }, value: 'PL' },
  { title: { en: 'Portugal', de: 'Portugal' }, value: 'PT' },
  { title: { en: 'Sweden', de: 'Schweden' }, value: 'SE' },
]

export const mapConfig = (config: ItsshopsConfig): CoreBackConfig => {
  const { uiLanguages, fieldLanguages, uiLocales, fieldLocales } = getLanguages(config.i18n);

  const features = normalizeFeatures(config.features)
  
  const coreSchemaSettings: ITSCoreSchemaSettings = {
    links: { allowedReferences: allowedDocumentReferenceTypes },
    menus: { disableSubmenus: false, allowedReferences: allowedDocumentReferenceTypes }
  };
  const schemaSettings = deepMerge(coreSchemaSettings, config.schemaSettings || {});

  const defaultCountryCode = config.defaultCountryCode || 'AT'
  const defaultCountry = countryOptions.find(c => c.value === defaultCountryCode)
  if (!defaultCountry) {
    throw new Error(`No country found for defaultCountryCode: ${defaultCountryCode}`)
  }

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
      countries: countryOptions
    },
    shop: {
      productTypes: {
        product: 1,
        variant: 2,
        bundle: 3
      }
    },
    defaultCountryCode,
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