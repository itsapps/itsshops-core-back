import type { ITSTranslator } from '../types'

import fields_de from './resources/fields_de'
import fields_en from './resources/fields_en'
import structure_de from './resources/structure_de'
import structure_en from './resources/structure_en'
import { flattenAndMerge } from '../utils'
import i18next from 'i18next'

type TranslatorConfig = {
  isDev: boolean
  fallbackLng: string
  supportedLngs: string[]
  overrides?: {
    fields?: Record<string, any>
    structure?: Record<string, any>
    general?: Record<string, any>
  }
}

type TranslatorFn = {
  (namespace: string, locale: string): ITSTranslator
}
export const createTranslator = (config: TranslatorConfig): TranslatorFn => {
  // const { defaultLocale, fieldLocales } = config.localization;
  const resources: Record<string, any> = {
    de: {
      schema: flattenAndMerge(fields_de, config.overrides?.fields?.de || {}),
      structure: flattenAndMerge(structure_de, config.overrides?.structure?.de || {}),
    },
    en: {
      schema: flattenAndMerge(fields_en, config.overrides?.fields?.en || {}),
      structure: flattenAndMerge(structure_en, config.overrides?.structure?.en || {}),
    },
  }

  const instance = i18next.createInstance();
  instance.init({
    saveMissing: config.isDev,
    fallbackLng: config.fallbackLng,
    supportedLngs: config.supportedLngs,
    resources,
    ns: ['schema', 'structure'],
    defaultNS: 'schema',
    interpolation: { escapeValue: false },
    // This ensures i18next returns 'undefined' if a key is missing 
    // instead of returning the key itself
    // returnEmptyString: false, 
    parseMissingKeyHandler: () => null,
  });

  return (namespace, locale) => {
    return {
      default: (key, fallback, params = {}) => {
        const text = instance.t(key, {
          lng: locale,
          ns: namespace,
          ...params
        })
        if (text) return text
        if (fallback) {
          const fb = !config.isDev ? fallback : `${fallback} [${key}]`
          if (fb) return fb
        }
        
        return key
      },
      strict: (key, params = {}) => {
        return instance.t(key, {
          lng: locale,
          ns: namespace,
          ...params
        });
      }
    };  
  }
  
};