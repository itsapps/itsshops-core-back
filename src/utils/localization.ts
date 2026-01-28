
export const createFormatHelpers = (locale: string) => ({
  date: (date: string | Date, options?: Intl.DateTimeFormatOptions) => formatDate(locale, date, options),
  number: (num: number, options?: Intl.NumberFormatOptions) => formatNumber(locale, num, options),
  currency: (num: number, currency = 'EUR') => formatCurrency(locale, num, currency),
});

export function formatDate(
  locale: string,
  date: string | Date | undefined,
  options: Intl.DateTimeFormatOptions = { 
    dateStyle: 'medium',
  }
) {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  options.timeZone = "Europe/Vienna";
  return new Intl.DateTimeFormat(locale, options).format(d);
}

export function formatNumber(locale: string, num: number | undefined, options?: Intl.NumberFormatOptions) {
  if (!num) return '';
  // return (number).toLocaleString(locale, options);
  return new Intl.NumberFormat(locale, options).format(num);
}

export function formatCurrency(locale: string, num: number | undefined, currency = 'EUR') {
  return formatNumber(locale, num, {
    style: 'currency',
    currency
  })
}

// Define the shape of your internationalized array items
interface I18nArrayItem {
  _key: string;
  value?: string | any;
}

export function getI18nValue<T>(items: any, locale: string, baseLocale: string): T | undefined {
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

/**
 * Requirement: Get a value from the new internationalized array structure.
 * Fallback: Requested Locale -> Base Locale -> First available locale -> null
 */
export const getI18nValueOld = (
  items: I18nArrayItem[] | undefined, 
  locale: string, 
  baseLocale: string = 'en'
) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  // 1. Try to find the requested locale
  const requested = items.find((item) => item._key === locale);
  if (requested?.value) return requested.value;

  // 2. Fallback to base language
  const base = items.find((item) => item._key === baseLocale);
  if (base?.value) return base.value;

  // 3. Find the first non-empty value available (Any other locale)
  const anyValue = items.find((item) => !!item.value);
  if (anyValue?.value) return anyValue.value;

  return null;
};

/**
 * Requirement: Extract a specific attribute from a document and localize it.
 */
export const getLocalizedAttr = (
  obj: any, 
  attribute: string, 
  locale: string, 
  baseLocale: string = 'en'
) => {
  if (!obj || !obj[attribute]) {
    return null;
  }
  
  const i18nArray = obj[attribute] as I18nArrayItem[];
  return getI18nValue(i18nArray, locale, baseLocale);
};

export const createI18nHelper = (locale: string, baseLocale: string) => {
  return <T>(data: any): T | undefined => getI18nValue<T>(data, locale, baseLocale);
};

export const createI18nDictHelper = (locale: string, baseLocale: string, supportedLocales: string[]) => {
  return <T>(data: any): T | undefined => getI18nDictValue<T>(data, locale, baseLocale, supportedLocales);
};