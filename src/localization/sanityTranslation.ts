import { deDELocale } from '@sanity/locale-de-de'
import { defineLocaleResourceBundle, LocaleResourceBundle } from 'sanity'

import { Language } from '../types'
import { deepMerge } from '../utils'
import studioDe from './resources/de'
import studioEn from './resources/en'

export const getTranslationPackage = (locale: string) => {
  if (locale === 'de') {
    return [deDELocale()]
  }

  return []
}

export function getTranslationBundles(
  languages: Language[],
  overrides?: any,
): LocaleResourceBundle[] {
  const resourceMap: Record<string, any> = { de: studioDe, en: studioEn }
  const merged = deepMerge(resourceMap, overrides || {})

  return languages.map((lang) =>
    defineLocaleResourceBundle({
      locale: lang.locale,
      namespace: 'itsapps',
      resources: () => merged[lang.id],
    }),
  )
}

export function getStructureOverrideBundles(languages: Language[]): LocaleResourceBundle[] {
  return languages
    .filter((lang) => lang.id !== 'en')
    .map((lang) =>
      defineLocaleResourceBundle({
        locale: lang.locale,
        namespace: 'studio',
        resources:
          lang.id === 'de'
            ? {
                'release.chip.draft': 'Entwurf',
                'release.chip.global.drafts': 'Entwürfe',
                'release.chip.tooltip.edited-date': 'Bearbeitet {{date}}',
                'release.chip.published': 'Veröffentlicht',
                'release.chip.tooltip.published-date': 'Veröffentlicht {{date}}',
              }
            : {},
      }),
    )
}
