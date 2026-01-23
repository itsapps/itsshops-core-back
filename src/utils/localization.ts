export const localizeDate = (
  dateString: string,
  locale: string,
  dateStyle?: "full" | "long" | "medium" | "short" | undefined,
  timeStyle?: "full" | "long" | "medium" | "short" | undefined
) => {
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: dateStyle || 'long',
    ...timeStyle && {timeStyle},
    timeZone: "Europe/Vienna",
  }
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale || "en", options).format(date);
};

export const localizeMoney = (number: number | undefined, locale: string) => {
  if (number === undefined || number === null) {
    return "";
  }
  return localizeNumber(number, locale, {
    style: "currency",
    currency: "EUR",
  });
};
  
export const localizeNumber = (number: number | undefined, locale: string, options={}) => {
  if (number === undefined || number === null) {
    return "";
  }
  return (number).toLocaleString(locale, options);
};

// Define the shape of your internationalized array items
interface I18nArrayItem {
  _key: string;
  value?: string | any;
}

/**
 * Requirement: Get a value from the new internationalized array structure.
 * Fallback: Requested Locale -> Base Locale -> First available locale -> null
 */
export const getI18nValue = (
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