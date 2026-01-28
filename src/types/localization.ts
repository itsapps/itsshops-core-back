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

export interface LocaleImage {
  _type: 'cropImage';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

export type ITSi18nImage = ITSi18nArray<LocaleImage>;

export interface ITSLocalizer {
  value: <T>(localizedField: any) => T | undefined;
  dictValue: <T>(localizedField: any) => T | undefined;
  objectValue: <T>(obj: any, key: string) => T | undefined;

  stringValue: (localizedField: any) => string | undefined;
  objectStringValue: (obj: any, key: string) => string | undefined;
  dictStringValue: (localizedField: any) => string | undefined;
}
export interface ITSFormatter {
  date: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  number: (num: number, options?: Intl.NumberFormatOptions) => string;
  currency: (num: number, currency?: string) => string;
}

export interface ITSTranslationHelpers {
  t: ITSTranslator;
  localizer: ITSLocalizer;
  format: ITSFormatter;
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
