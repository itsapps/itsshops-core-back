// packages/core-back/src/config/mapper.ts
import { ItsshopsConfig, CoreBackConfig } from '../types';
import { getLanguages } from '../localization'; // Assuming this helper exists

const sanityApiVersion = 'v2025-05-25';

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

  const features = {
    shop: {
      enabled: config.features?.shop?.enabled ?? false,
      manufacturer: config.features?.shop?.manufacturer ?? false
    },
    blog: config.features?.blog ?? false,
    users: config.features?.users ?? false,
  };

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
      localizedFieldTypes: config.i18n?.localizedFieldTypes || [],
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
    schemaExtensions: config.schemaExtensions || {},
    apiVersion: sanityApiVersion,
  };
};