// packages/core-back/src/config/mapper.ts
import { ItsshopsConfig, CoreBackConfig } from '../types';
import { getLanguages } from '../localization'; // Assuming this helper exists

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
      }
    },
    features,
    schemaExtensions: config.schemaExtensions || {},
  };
};