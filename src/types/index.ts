import { ComponentType } from 'react';
import { 
  FieldDefinition,
  FieldGroupDefinition,
  FieldsetDefinition,
  Rule, 
  PreviewConfig,
  DocumentActionComponent,
  TFunction,
} from 'sanity';

export type SanityDefinedAction = NonNullable<DocumentActionComponent['action']>

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

export interface ITSTranslator {
  default: TranslatorFunction;
  strict: StrictTranslatorFunction;
}
export interface ITSLocalizer {
  value: <T>(localizedField: any) => T | undefined;
  dictValue: <T>(localizedField: any) => T | undefined;
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

export type ITSFeatureKey = 'shop' | 'shop.manufacturer' | 'blog' | 'users';
export type ITSFeatureRegistry = {
  all: CoreDocument[];
  get: (name: string) => CoreDocument | undefined;
  isFeatureEnabled: (name: ITSFeatureKey) => boolean;
  getEnabled: () => CoreDocument[];
  isEnabled: (name: string) => boolean;
}

export interface ITSContext {
  config: CoreBackConfig;
  featureRegistry: ITSFeatureRegistry;
  locale: string;
  helpers: ITSTranslationHelpers;
}

export interface ITSProviderContext extends ITSContext {
  t: TFunction
}

export interface FieldContext extends ITSContext {
  f: FieldFactory;
}

/** 4. Configuration & Extensions **/
export interface SchemaExtension {
  icon?: ComponentType;
  groups?: FieldGroupDefinition[] | ((ctx: ITSContext) => FieldGroupDefinition[]);
  removeGroups?: string[];
  fieldsets?: FieldsetDefinition[] | ((ctx: ITSContext) => FieldsetDefinition[]);
  fields?: (ctx: FieldContext) => FieldDefinition[];
  // fieldOverrides?: Record<string, CoreFieldOptions> | ((ctx: FieldContext) => Record<string, CoreFieldOptions>);
  fieldOverrides?: 
    | Record<string, Partial<FieldDefinition>> 
    | ((ctx: FieldContext) => Record<string, Partial<FieldDefinition>>);
  preview?: (ctx: ITSContext) => PreviewConfig;
  order?: string[];
}

export interface CoreObject {
  name: string;
  // We keep 'type' optional because most of the time it's 'object'
  type?: 'object' | 'block' | 'image' | 'file' | 'string' | 'number'; 
  build: (ctx: FieldContext) => {
    // We allow the build function to return ANY valid Sanity property
    [key: string]: any; 
  };
}

export interface ITSStructureItem {
  type: 'document' | 'singleton' | 'group' | 'divider' | 'custom';
  id: string;
  title?: string;
  icon?: any;
  feature?: ITSFeatureKey;
  children?: ITSStructureItem[];
  component?: (S: any, context: any, ctx: ITSContext) => any;
  // Positioning logic:
  position?: {
    anchor?: 'top' | 'bottom' | string; // 'string' would be the ID of another item
    placement?: 'before' | 'after';
  };
}

export interface CoreDocument {
  name: string;
  icon?: ComponentType;
  groups?: FieldGroupDefinition[] | ((ctx: ITSContext) => FieldGroupDefinition[]);
  fieldsets?: FieldsetDefinition[] | ((ctx: ITSContext) => FieldsetDefinition[]);
  baseFields: (ctx: FieldContext) => FieldDefinition[];
  preview?: (ctx: ITSContext) => PreviewConfig;
  feature?: ITSFeatureKey;
  isSingleton?: boolean;
  allowCreate?: boolean;
  disallowedActions?: SanityDefinedAction[];
  initialValue?: Record<string, any> | ((ctx: ITSContext) => Record<string, any>);
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
    shop?: {
      enabled: boolean;
      manufacturer?: boolean;
    };
    blog?: boolean;
    users?: boolean;
  };
  integrations: {
    netlify: { accessToken: string; siteId: string, projectName: string };
  };
  schemaExtensions?: Record<string, SchemaExtension>;
  documents?: CoreDocument[];
  objects?: CoreObject[];
  structure?: ITSStructureItem[];
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
    shop: {
      enabled: boolean;
      manufacturer: boolean;
    };
    blog: boolean;
    users: boolean;
  };
}