// packages/core-back/src/types/index.ts
import { 
  FieldDefinition,
  FieldGroupDefinition,
  FieldsetDefinition,
  Rule, 
  PreviewConfig,
  ObjectDefinition as SanityObjectDefinition
} from 'sanity';

/** 1. Localization Types **/
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

/** 2. Field Factory Types **/
export type I18nRuleShortcut = 
  | 'requiredDefault' 
  | 'requiredDefaultWarning'
  | 'requiredAll'
  | 'atLeastOne'
  | 'atLeastOneWarning'
  | { min?: number; max?: number; warning?: boolean };

export type I18nValidationOptions = I18nRuleShortcut | I18nRuleShortcut[];

export type CoreFieldOptions = Omit<Partial<FieldDefinition>, 'validation'> & {
  i18n?: I18nValidationOptions;
  validation?: (rule: Rule) => any;
  tKey?: string;
  [key: string]: any;
};

export type FieldFactory = (
  fieldName: string, 
  type?: string, 
  overrides?: CoreFieldOptions
) => FieldDefinition;

/** 3. Context Types (The "Toolbox") **/
export interface SchemaContext {
  t: TranslatorFunction;
  tStrict: StrictTranslatorFunction;
  getLocalizedValue: <T>(localizedField: any) => T | undefined;
  format: {
    date: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
    number: (num: number, options?: Intl.NumberFormatOptions) => string;
    currency: (num: number, currency?: string) => string;
  };
  config: CoreBackConfig;
  locale: string;
}

export interface FieldContext extends SchemaContext {
  f: FieldFactory;
}

/** 4. Configuration & Extensions **/
export interface SchemaExtension {
  groups?: FieldGroupDefinition[] | ((ctx: SchemaContext) => FieldGroupDefinition[]);
  fieldsets?: FieldsetDefinition[] | ((ctx: SchemaContext) => FieldsetDefinition[]);
  fields?: (ctx: FieldContext) => FieldDefinition[];
  // fieldOverrides?: Record<string, CoreFieldOptions> | ((ctx: FieldContext) => Record<string, CoreFieldOptions>);
  fieldOverrides?: 
    | Record<string, Partial<FieldDefinition>> 
    | ((ctx: FieldContext) => Record<string, Partial<FieldDefinition>>);
  preview?: (ctx: SchemaContext) => PreviewConfig;
  order?: string[];
}

// export interface DocumentDefinition {
//   name: string;
//   baseFields: (ctx: FieldContext) => FieldDefinition[],
//   preview: (ctx: SchemaContext) => any
// }

// export interface ObjectDefinition {
//   name: string;
//   type?: string;
//   // build: (ctx: FieldContext) => Omit<Partial<SanityObjectDefinition>, 'title'>;
//   build: (ctx: FieldContext) => Omit<SanityObjectDefinition, 'name' | 'type'>;
//   // baseFields: (ctx: FieldContext) => FieldDefinition[],
//   // baseFieldsets?: (ctx: FieldContext) => FieldsetDefinition[],
//   // [key: string]: any;
// }

export interface CoreObject {
  name: string;
  type?: 'object' | 'image' | 'file'; // Restricted to container types
  build: (ctx: FieldContext) => {
    options?: Record<string, any>;
    fields?: FieldDefinition[];
    preview?: any;
    // We allow any other valid Sanity property here
    [key: string]: any; 
  };
}

export interface CoreDocument {
  name: string;
  baseFields: (ctx: FieldContext) => FieldDefinition[];
  preview: (ctx: SchemaContext) => any;
}

export interface ItsshopsConfig {
  isDev: boolean;
  projectId: string;
  dataset: string;
  workspaceName: string;
  i18n?: {
    ui?: string[];
    fields?: string[];
    defaultLocale: string;
    fieldTranslationOverrides?: Record<string, any>;
    structureTranslationOverrides?: Record<string, any>;
    translationOverrides?: Record<string, any>;
    localizedFieldTypes?: string[]
  };
  features?: {
    shop?: boolean;
    blog?: boolean;
    users?: boolean;
  };
  integrations: {
    netlify: { accessToken: string; siteId: string };
  };
  schemaExtensions?: Record<string, SchemaExtension>;
}

/** Internal version of the config used by the engine **/
export interface CoreBackConfig extends Omit<ItsshopsConfig, 'features'> {
  localization: {
    uiLanguages: Language[];
    fieldLanguages: Language[];
    uiLocales: string[];
    fieldLocales: string[];
    defaultLocale: string;
    localizedFieldTypes: string[];
    overrides: {
      fields: Record<string, any>;
      structure: Record<string, any>;
      general: Record<string, any>;
    };
  };
  features: {
    shop: boolean;
    blog: boolean;
    users: boolean;
  };
}


// // Re-export everything from the sub-files
// export * from './config';
// export * from './localization';
// export * from './schema';

// // Define the "Toolbox" type to clean up factory signatures
// import { TranslatorFunction, StrictTranslatorFunction } from './localization';
// import { CoreBackConfig } from './config';
// import { FieldFactory } from './schema';

// /** The standard bundle of tools passed to every schema and extension */
// export interface SchemaContext {
//   t: TranslatorFunction;
//   tStrict: StrictTranslatorFunction;
//   config: CoreBackConfig;
//   locale: string;
// }

// export interface LocalSchemaContext extends SchemaContext {
//   f: FieldFactory;
// }

// export interface StructureContext {
//   t: TranslatorFunction;
//   tStrict: StrictTranslatorFunction;
//   config: CoreBackConfig;
//   locale: string;
// }