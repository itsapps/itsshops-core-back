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
                // Newer than @sanity/locale-de-de 1.1.37: collapsed arrays (> 4 items)
                'inputs.array.action.show-all-items': 'Alle {{count}} Einträge anzeigen',
                'inputs.array.action.show-all-items_one': '1 Eintrag anzeigen',
                'inputs.array.action.show-all-items_other': 'Alle {{count}} Einträge anzeigen',
              }
            : {},
      }),
    )
    .concat(
      languages
        .filter((lang) => lang.id === 'de')
        .map((lang) =>
          defineLocaleResourceBundle({
            locale: lang.locale,
            namespace: 'structure',
            // "Neues {{schemaType}}" is wrong for feminine/masculine types ("Neues Option").
            resources: {
              'panes.document-header-title.new.text': 'Neu: {{schemaType}}',
              'browser-document-title.new-document': 'Neu: {{schemaType}}',
            },
          }),
        ),
    )
}
