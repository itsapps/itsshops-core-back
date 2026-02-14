import { Language } from '../types'

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