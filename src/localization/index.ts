import { Language, LocaleTranslations, CoreBackConfig } from '../types'
import fields_de from './resources/fields_de'
import fields_en from './resources/fields_en'
import structure_de from './resources/structure_de'
import structure_en from './resources/structure_en'
import { deDELocale } from '@sanity/locale-de-de'
import { flattenAndMerge, deepMerge } from '../utils'
import i18next from 'i18next'

import studio_de from './resources/de'
import studio_en from './resources/en'

import {defineLocaleResourceBundle} from 'sanity'

const studioUILanguages: Language[] = [
  { id: 'de', title: 'Deutsch', locale: 'de-DE', weekInfo: {firstDay: 1, weekend: [6, 7], minimalDays: 5} },
  { id: 'en', title: 'English', locale: 'en-US', weekInfo: {firstDay: 1, weekend: [6, 7], minimalDays: 5} },
]
const fieldUILanguages: Language[] = [
  ...studioUILanguages,
  { id: 'fr', title: 'Français', locale: 'fr-FR', weekInfo: {firstDay: 1, weekend: [6, 7], minimalDays: 5} },
]

export function getLanguages(config?: {
  ui?: string[]
  fields?: string[]
  defaultLocale?: string
}) {
  const defaultLocale = config?.defaultLocale || 'en'

  // 1️⃣ Supported UI languages
  let uiLanguages = config?.ui
    ? studioUILanguages.filter(lang => config!.ui!.includes(lang.id))
    : [...studioUILanguages]

  // Ensure defaultLocale is included
  if (!uiLanguages.some(l => l.id === defaultLocale)) {
    const defaultLang = studioUILanguages.find(l => l.id === defaultLocale)
    if (defaultLang) uiLanguages.push(defaultLang)
  }

  // Move defaultLocale to the first position
  uiLanguages.sort((a, b) => (a.id === defaultLocale ? -1 : b.id === defaultLocale ? 1 : 0))

  // 2️⃣ Field languages
  let fieldLanguages = config?.fields
    ? fieldUILanguages.filter(lang => config!.fields!.includes(lang.id))
    : [...fieldUILanguages]

  // Ensure defaultLocale is included
  if (!fieldLanguages.some(l => l.id === defaultLocale)) {
    const defaultLang = fieldUILanguages.find(l => l.id === defaultLocale)
    if (defaultLang) fieldLanguages.push(defaultLang)
  }

  // Move defaultLocale to the first position
  fieldLanguages.sort((a, b) => (a.id === defaultLocale ? -1 : b.id === defaultLocale ? 1 : 0))


  // 3️⃣ Warn if any UI locale is missing in fields
  const missingInFields = uiLanguages
    .map(l => l.id)
    .filter(id => !fieldLanguages.some(f => f.id === id))

  if (missingInFields.length) {
    console.warn(
      `[i18n] Warning: The following UI locales are missing in field languages: ${missingInFields.join(
        ', '
      )}`
    )
  }

  return {
    uiLanguages,
    fieldLanguages,
    uiLocales: uiLanguages.map(l => l.id),
    fieldLocales: fieldLanguages.map(l => l.id)
  }
}

export const getTranslationPackage = (locale: string) => {
  switch (locale) {
    case 'de':
      return [deDELocale()]
  }
  return []
}

export function getTranslationBundles(languages: Language[], overrides?: LocaleTranslations) {
  const resourceMap: Record<string, any> = { de: studio_de, en: studio_en }
  const merged = deepMerge(resourceMap, overrides || {})

  return languages
    .map((lang) => defineLocaleResourceBundle({
      locale: lang.locale,
      namespace: 'itsapps',
      resources: () => merged[lang.id],
    })
  )
} 

export function getStructureOverrideBundles(languages: Language[]) {
  return languages
    .filter(lang => lang.id !== "en")
    .map((lang) => defineLocaleResourceBundle({
      locale: lang.locale,
      namespace: 'studio',
      resources: lang.id === "de" ? {
        'release.chip.draft': 'Entwurf',
        'release.chip.global.drafts': 'Entwürfe',
        'release.chip.tooltip.edited-date': 'Bearbeitet {{date}}',
        'release.chip.published': 'Veröffentlicht',
        'release.chip.tooltip.published-date': 'Veröffentlicht {{date}}',
      } : {},
    })
  )
}


// export const translator = (translations: LocaleTranslations): TranslatorFunction => {
//   const getTranslationKeyPath = ( { keyPath, defaultValue, params }: TranslationProps): string => {
//     const path = keyPath.split('.').reduce((obj, key) => obj?.[key], translations);
//     // let translation = get(translations, path, path);
//     let translation = typeof path === 'string' ? path : get(translations, keyPath, defaultValue);
//     if (!params) return translation
//     Object.entries(params).forEach(([k,v]) => {
//       translation = translation.replace(`{{${k}}}`, v)
//     })
//     return translation
//   }
//   return getTranslationKeyPath
// }

// const fieldTranslations: LocaleTranslations = {
//   'de': fields_de,
//   'en': fields_en,
// }
// export function createTranslator (translations: LocaleTranslations, languages: Language[], language: Language, overrides?: LocaleTranslations) {
//   const merged = deepMerge(translations[language.id], overrides?.[language.id] || {})
//   // const usedTranslations = languages.map(l => fieldTranslations[l.id])
//   return function (props: TranslationProps): string {
//     return translator(merged)(props)
//   }
// }
// export const createFieldTranslator = (
//   languages: Language[],
//   language: Language,
//   overrides?: LocaleTranslations
// ) => createTranslator(fieldTranslations, languages, language, overrides)

// export const createStructureTranslator = (
//   languages: Language[],
//   language: Language,
//   overrides?: LocaleTranslations
// ) => createTranslator(structureTranslations, languages, language, overrides)

export const createCoreTranslator = (
  config: CoreBackConfig,
  locale: string
) => {
  // const { defaultLocale, fieldLocales } = config.localization;
  const resources: Record<string, any> = {
    de: () => ({
      schema: flattenAndMerge(fields_de, config.localization.fieldTranslationOverrides?.de || {}),
      structure: flattenAndMerge(structure_de, config.localization.structureTranslationOverrides?.de || {}),
    }),
    en: () => ({
      schema: flattenAndMerge(fields_en, config.localization.fieldTranslationOverrides?.en || {}),
      structure: flattenAndMerge(structure_en, config.localization.structureTranslationOverrides?.en || {}),
    }),
  }

  const instance = i18next.createInstance();
  instance.init({
    saveMissing: config.isDev,
    lng: locale,
    // fallbackLng: defaultLocale,
    // supportedLngs: fieldLocales,
    resources: {de: resources?.[locale]() || {}},
    ns: ['schema', 'structure'],
    defaultNS: 'schema',
    interpolation: { escapeValue: false },
    // This ensures i18next returns 'undefined' if a key is missing 
    // instead of returning the key itself
    returnEmptyString: false, 
  });

  return {
    // t: (key, fallback, params) => instance.t(key, { defaultValue: fallback || key, ...params }),
    // tStrict: (key, params) => instance.exists(key) ? instance.t(key, params) : undefined
    // Standard t function for titles (with fallback)
    t: (key: string, fallback?: string, params = {}) => {
      const exists = instance.exists(key);
      if (!exists) return fallback || key; // Return placeholder
      return instance.t(key, params);
    },

    // Strict function for descriptions (no fallback)
    tStrict: (key: string, params = {}) => {
      if (!instance.exists(key)) return undefined;
      return instance.t(key, params);
    }
  };
};