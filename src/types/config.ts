import { FieldDefinition } from 'sanity';
import { Language, TranslatorFunction, LocaleTranslations } from './localization'
// import { FieldFactory } from './schema'
import { FieldFactory, CoreFieldOptions } from './schema';

export type CoreIntegrationsConfig = {
  netlify: {
    accessToken: string
    siteId: string
  }
}
export type ItsshopsFeaturesConfig = {
  shop?: boolean
  blog?: boolean
  users?: boolean
}
export type CoreFeaturesConfig = {
  shop: boolean
  blog: boolean
  users: boolean
}

export interface SchemaExtension {
  // Now these can be functions that receive the translator
  groups?: any[] | ((t: TranslatorFunction) => any[]);
  fieldsets?: any[] | ((t: TranslatorFunction) => any[]);
  fields?: FieldDefinition[] | ((t: TranslatorFunction, f: FieldFactory) => FieldDefinition[]);
  overrides?: Record<string, CoreFieldOptions> | ((t: TranslatorFunction, f: FieldFactory) => Record<string, CoreFieldOptions>);
  order?: string[];
}
export interface ItsshopsConfig {
  isDev: boolean,
  projectId: string
  dataset: string
  workspaceName: string
  i18n?: {
    ui?: string[]
    fields?: string[]
    defaultLocale: string
    fieldTranslationOverrides?: LocaleTranslations
    structureTranslationOverrides?: LocaleTranslations
    translationOverrides?: LocaleTranslations
    localizedFieldTypes?: string[]
  }
  features?: ItsshopsFeaturesConfig
  schemaExtensions?: {
    product?: SchemaExtension;
    // page?: SchemaExtension;
    // ... add more as needed
    [key: string]: SchemaExtension | undefined;
  };
  integrations: CoreIntegrationsConfig,
  // fieldTranslations?: LocaleTranslations
}

export interface CoreBackConfig {
  isDev: boolean,
  localization: {
    uiLanguages: Language[]
    fieldLanguages: Language[]
    uiLocales: string[]
    fieldLocales: string[]
    fieldTranslationOverrides?: LocaleTranslations
    structureTranslationOverrides?: LocaleTranslations
    translationOverrides?: LocaleTranslations
    defaultLocale: string
  }
  features: CoreFeaturesConfig
  integrations: CoreIntegrationsConfig
  schemaExtensions?: {
    product?: SchemaExtension;
    [key: string]: SchemaExtension | undefined;
  };
}