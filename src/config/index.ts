import { getLanguages } from '../localization'
import { CoreBackConfig, ItsshopsConfig } from '../types'

let coreConfig: CoreBackConfig | null = null;

export const setCoreConfig = (config: ItsshopsConfig): CoreBackConfig => {
  const {uiLanguages, fieldLanguages, uiLocales, fieldLocales} = getLanguages(config.i18n)

  const features = {
    shop: false,
    blog: false,
    users: false,
    ...config.features && config.features
  }
  coreConfig = {
    isDev: config.isDev,
    localization: {
      uiLanguages,
      fieldLanguages,
      uiLocales,
      fieldLocales,
      fieldTranslationOverrides: config.i18n?.fieldTranslationOverrides,
      structureTranslationOverrides: config.i18n?.structureTranslationOverrides,
      translationOverrides: config.i18n?.translationOverrides,
      defaultLocale: config.i18n?.defaultLocale || uiLocales?.[0] || 'en',
    },
    features,
    integrations: {
      netlify: config.integrations.netlify
    },
    schemaExtensions: config.schemaExtensions,
  };
  return coreConfig;
};

export const getCoreConfig = (): CoreBackConfig => {
  if (!coreConfig) {
    throw new Error('Core config has not been set. Make sure createCoreBack has been called.');
  }
  return coreConfig;
};
