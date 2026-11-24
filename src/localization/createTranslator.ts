import i18next from 'i18next'

import type { ITSTranslator } from '../types'
import { flattenAndMerge } from '../utils'
import componentsDe from './resources/components_de'
import componentsEn from './resources/components_en'
import fieldsDe from './resources/fields_de'
import fieldsEn from './resources/fields_en'
import structureDe from './resources/structure_de'
import structureEn from './resources/structure_en'

type TranslatorConfig = {
  isDev: boolean
  fallbackLng: string
  supportedLngs: string[]
  overrides?: {
    fields?: Record<string, any>
    structure?: Record<string, any>
    components?: Record<string, any>
  }
}

type TranslatorFn = {
  (namespace: string, locale: string): ITSTranslator
}
export const createTranslator = (config: TranslatorConfig): TranslatorFn => {
  // const { defaultLocale, fieldLocales } = config.localization;
  const resources: Record<string, any> = {
    de: {
      schema: flattenAndMerge(fieldsDe, config.overrides?.fields?.de || {}),
      structure: flattenAndMerge(structureDe, config.overrides?.structure?.de || {}),
      components: flattenAndMerge(componentsDe, config.overrides?.structure?.de || {}),
    },
    en: {
      schema: flattenAndMerge(fieldsEn, config.overrides?.fields?.en || {}),
      structure: flattenAndMerge(structureEn, config.overrides?.structure?.en || {}),
      components: flattenAndMerge(componentsEn, config.overrides?.structure?.en || {}),
    },
  }

  const instance = i18next.createInstance()
  instance.init({
    // saveMissing: config.isDev,
    fallbackLng: config.fallbackLng,
    supportedLngs: config.supportedLngs,
    resources,
    ns: ['schema', 'structure', 'components'],
    defaultNS: 'schema',
    interpolation: { escapeValue: false },
    // This ensures i18next returns 'undefined' if a key is missing
    // instead of returning the key itself
    // returnEmptyString: false,
    parseMissingKeyHandler: () => null,
  })

  return (namespace, locale) => {
    return {
      default: (key, fallback, params = {}) => {
        const text = instance.t(key, {
          lng: locale,
          ns: namespace,
          ...params,
        })
        if (text) return text
        if (fallback) {
          const fb = config.isDev ? `${fallback} [${key}]` : fallback
          if (fb) return fb
        }

        return key
      },
      strict: (key, params = {}) => {
        return instance.t(key, {
          lng: locale,
          ns: namespace,
          ...params,
        })
      },
    }
  }
}
