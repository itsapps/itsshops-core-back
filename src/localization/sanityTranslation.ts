import { deDELocale } from '@sanity/locale-de-de'
import { defineLocaleResourceBundle, LocaleResourceBundle } from 'sanity'

import { Language } from '../types'

export const getTranslationPackage = (locale: string) => {
  if (locale === 'de') {
    return [deDELocale()]
  }

  return []
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
