
export interface Language {
  id: string
  title: string
  locale: string
  weekInfo: {firstDay: number, weekend: number[], minimalDays: number}
}

export type NestedTranslations = {
  [key: string]: string | NestedTranslations;
};

export type LocaleTranslations = {
  [locale: string]: NestedTranslations;
};

// export type TranslatorParams = {
//   [key: string]: string | number
// }

// export type TranslationProps  = {
//   keyPath: string
//   defaultValue?: string
//   params?: TranslatorParams
// }

// export type TranslatorFunction = (props: TranslationProps) => string;
// export type LocalizedSchemaBuilder = (t: TranslatorFunction, language: Language, validators: CustomValidators) => SchemaTypeDefinition;

/**
 * Simple key-value pair for i18next interpolation (e.g., {{count}})
 */
export type TranslatorParams = Record<string, string | number | boolean>;

/**
 * The primary translation function signature.
 * It matches the i18next pattern but stays specialized for your Core.
 */
export type TranslatorFunction = (
  key: string, 
  fallback?: string, 
  params?: TranslatorParams
) => string;

/**
 * A strict version for descriptions where we want to return 
 * undefined if no translation exists.
 */
export type StrictTranslatorFunction = (
  key: string, 
  params?: TranslatorParams
) => string | undefined;