import { Language } from '../types'
import { fieldUILanguages, studioUILanguages } from './constants/languages'

export function getLanguages(config?: {
  ui?: string[]
  fields?: string[]
  defaultLocale?: string
}): {
  uiLanguages: Language[]
  fieldLanguages: Language[]
  uiLocales: string[]
  fieldLocales: string[]
} {
  const defaultLocale = config?.defaultLocale || 'en'

  // 1️⃣ Supported UI languages
  const uiLanguages = config?.ui
    ? studioUILanguages.filter((lang) => config!.ui!.includes(lang.id))
    : [...studioUILanguages]

  // Ensure defaultLocale is included
  if (!uiLanguages.some((l) => l.id === defaultLocale)) {
    const defaultLang = studioUILanguages.find((l) => l.id === defaultLocale)
    if (defaultLang) uiLanguages.push(defaultLang)
  }

  // Move defaultLocale to the first position
  uiLanguages.sort((a, b) => {
    if (a.id === defaultLocale) return -1
    if (b.id === defaultLocale) return 1
    return 0
  })

  // 2️⃣ Field languages
  const fieldLanguages = config?.fields
    ? fieldUILanguages.filter((lang) => config!.fields!.includes(lang.id))
    : [...fieldUILanguages]

  // Ensure defaultLocale is included
  if (!fieldLanguages.some((l) => l.id === defaultLocale)) {
    const defaultLang = fieldUILanguages.find((l) => l.id === defaultLocale)
    if (defaultLang) fieldLanguages.push(defaultLang)
  }

  // Move defaultLocale to the first position
  fieldLanguages.sort((a, b) => {
    if (a.id === defaultLocale) return -1
    if (b.id === defaultLocale) return 1
    return 0
  })

  // 3️⃣ Warn if any UI locale is missing in fields
  const missingInFields = uiLanguages
    .map((l) => l.id)
    .filter((id) => !fieldLanguages.some((f) => f.id === id))

  if (missingInFields.length) {
    console.warn(
      `[i18n] Warning: The following UI locales are missing in field languages: ${missingInFields.join(
        ', ',
      )}`,
    )
  }

  return {
    uiLanguages,
    fieldLanguages,
    uiLocales: uiLanguages.map((l) => l.id),
    fieldLocales: fieldLanguages.map((l) => l.id),
  }
}
