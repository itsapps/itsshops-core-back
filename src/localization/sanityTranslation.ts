import { Language } from '../types'

import { deDELocale } from '@sanity/locale-de-de'
import { deepMerge } from '../utils'

import studio_de from './resources/de'
import studio_en from './resources/en'

import {defineLocaleResourceBundle} from 'sanity'

export const getTranslationPackage = (locale: string) => {
  switch (locale) {
    case 'de':
      return [deDELocale()]
  }
  return []
}

export function getTranslationBundles(languages: Language[], overrides?: any) {
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