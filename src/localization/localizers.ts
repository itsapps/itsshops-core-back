import type { ITSLocalizer } from '../types/localization'

export const createI18nHelpers = (locale: string, baseLocale: string): ITSLocalizer => ({
  value: (data) => getI18nArrayValue(data, locale, baseLocale),
  dictValue: (data) => getI18nDictValue(data, locale, baseLocale, [locale, baseLocale]),
})

export function getI18nArrayValue<T>(
  items: unknown,
  locale: string,
  baseLocale: string,
): T | undefined {
  if (!items || !Array.isArray(items) || items.length === 0) return undefined
  // const match = data.find(item => item.language === locale) || data[0];
  // return match?.value;
  // 1. Try to find the requested locale
  const requested = items.find((item) => item.language === locale)
  if (requested?.value) return requested.value

  // 2. Fallback to base language
  const base = items.find((item) => item.language === baseLocale)
  if (base?.value) return base.value

  // 3. Find the first non-empty value available (Any other locale)
  const anyValue = items.find((item) => !!item.value)
  if (anyValue?.value) return anyValue.value

  return undefined
}

export function getI18nDictValue<T>(
  item: unknown,
  locale: string,
  baseLocale: string,
  supportedLocales: string[],
): T | undefined {
  if (!item || typeof item !== 'object') {
    return undefined
  }
  const dict = item as Record<string, T>
  if (locale in dict) {
    return dict[locale]
  } else if (baseLocale in dict) {
    return dict[baseLocale]
  }
  // find in other locales
  for (const key of supportedLocales) {
    if (key !== locale && key !== baseLocale && dict[key]) {
      return dict[key]
    }
  }

  return undefined
}
