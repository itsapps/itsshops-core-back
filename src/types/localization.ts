export interface Language {
  id: string;
  title: string;
  locale: string;
  weekInfo: {firstDay: number, weekend: number[], minimalDays: number}
}

export type TranslatorParams = Record<string, string | number | boolean>;

export type TranslatorFunction = (
  key: string, 
  fallback?: string, 
  params?: TranslatorParams
) => string;

export type StrictTranslatorFunction = (
  key: string, 
  params?: TranslatorParams
) => string | undefined;

export interface ITSTranslator {
  default: TranslatorFunction;
  strict: StrictTranslatorFunction;
}

export interface ITSi18nEntry<T = string> {
  _key: string; 
  value?: T;
}
// export interface ITSi18nStringEntry {
//   _key: string; // The locale code, e.g., 'en', 'de'
//   value?: string;
// }
// export type ITSi18nString = ITSi18nStringEntry[];
export type ITSi18nArray<T = string> = ITSi18nEntry<T>[];

// export interface LocaleImage {
//   _type: 'localeImage';
//   image: {
//     asset: {
//       _ref: string;
//       _type: 'reference';
//     };
//   },
//   alt?: ITSi18nArray;
//   title?: ITSi18nArray;
// }
export interface LocaleImage {
  _type: 'cropImage';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

export type ITSi18nImage = ITSi18nArray<LocaleImage>;

export type ITSi18nLocalizerValue = <T = string>(data: any) => T | undefined;
export type ITSi18nLocalizerObjectValue = <T = string>(data: any, key: string) => T | undefined;

export interface ITSLocalizer {
  value: ITSi18nLocalizerValue;
  objectValue: ITSi18nLocalizerObjectValue;
  dictValue: ITSi18nLocalizerValue;
  dictObjectValue: ITSi18nLocalizerObjectValue;
}
export interface ITSFormatter {
  date: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  number: (num: number, options?: Intl.NumberFormatOptions) => string;
  currency: (num: number, currency?: string) => string;
}

/** 2. Field Factory Types **/
export type I18nRuleShortcut = 
  | 'requiredDefault' 
  | 'requiredDefaultWarning'
  | 'requiredAll'
  | 'atLeastOne'
  | 'atLeastOneWarning'
  | { min?: number; max?: number; warning?: boolean };

export type I18nValidationOptions = I18nRuleShortcut | I18nRuleShortcut[];
