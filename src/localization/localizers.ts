import type { ITSLocalizer } from '../types/localization';

export const createI18nHelpers = (locale: string, baseLocale: string): ITSLocalizer => ({
  value: (data) => getI18nArrayValue(data, locale, baseLocale),
  objectValue: (data, key) => getI18nArrayValue(data?.[key], locale, baseLocale),
  dictValue: (data) => getI18nDictValue(data, locale, baseLocale, [locale, baseLocale]),
  dictObjectValue: (data, key) => getI18nDictValue(data?.[key], locale, baseLocale, [locale, baseLocale]),
})

export function getI18nArrayValue<T>(items: any, locale: string, baseLocale: string): T | undefined {
  if (!items || !Array.isArray(items) || items.length === 0) return undefined;
  // const match = data.find(item => item._key === locale) || data[0];
  // return match?.value;
  // 1. Try to find the requested locale
  const requested = items.find((item) => item._key === locale);
  if (requested?.value) return requested.value;

  // 2. Fallback to base language
  const base = items.find((item) => item._key === baseLocale);
  if (base?.value) return base.value;

  // 3. Find the first non-empty value available (Any other locale)
  const anyValue = items.find((item) => !!item.value);
  if (anyValue?.value) return anyValue.value;

  return undefined;
}

export function getI18nDictValue<T>(item: any, locale: string, baseLocale: string, supportedLocales: string[]): T | undefined {
  if (! item) {
    return undefined;
  }
  if (locale in item) {
    return item[locale];
  } else if (baseLocale in item) {
    return item[baseLocale];
  } else {
    // find in other locales
    for (const key of supportedLocales) {
      if (key !== locale && key !== baseLocale && item[key]) {
        return item[key];
      }
    }
  }
  return undefined;
}