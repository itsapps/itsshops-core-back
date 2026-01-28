export * from './localization';
export * from './mail';
export * from './netlify';
export * from './frontend';
export * from './orders';
export * from './schema';

import {
  I18nValidationOptions,
  Language,
  ITSTranslator,
  ITSLocalizer,
  ITSFormatter,
} from './localization';
import { ITSFrontendClient } from './frontend';

import { ComponentType } from 'react';
import {
  ArrayOfType,
  ReferenceTo,
  SchemaTypeDefinition,
  ObjectDefinition,
  FieldDefinition,
  FieldGroupDefinition,
  FieldsetDefinition,
  Rule, 
  PreviewConfig,
  DocumentActionComponent,
  TFunction,
} from 'sanity';

export type SanityDefinedAction = NonNullable<DocumentActionComponent['action']>

export type CoreFieldOptions = Omit<Partial<FieldDefinition>, 'validation' | 'to' | 'of' > & {
  i18n?: I18nValidationOptions;
  validation?: (rule: Rule) => any;
  tKey?: string;
  to?: ReferenceTo[];
  of?: ArrayOfType[];
  [key: string]: any;
};

export type FieldFactory = (
  fieldName: string, 
  type?: string, 
  overrides?: CoreFieldOptions
) => FieldDefinition;

export type ITSFeatureKey = 'shop' | 'shop.manufacturer' | 'blog' | 'users';
export type ITSFeatureRegistry = {
  isFeatureEnabled: (name: ITSFeatureKey) => boolean;
  allDocs: CoreDocument[];
  getDoc: (name: string) => CoreDocument | undefined;
  getEnabledDocs: () => CoreDocument[];
  isDocEnabled: (name: string) => boolean;
  allObjects: CoreObject[];
  getObject: (name: string) => CoreObject | undefined;
  getEnabledObjects: () => CoreObject[];
  isObjectEnabled: (name: string) => boolean;
}

export interface ITSLocaleContext {
  config: CoreBackConfig;
  featureRegistry: ITSFeatureRegistry;
  locale: string;
  localizer: ITSLocalizer;
  format: ITSFormatter;
}
export interface ITSContext extends ITSLocaleContext {
  t: ITSTranslator;
}

export interface ITSProviderContext extends ITSLocaleContext {
  t: TFunction;
  frontendClient: ITSFrontendClient;
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

// export interface CoreObject {
//   name: string;
//   // We keep 'type' optional because most of the time it's 'object'
//   type?: 'object' | 'block' | 'image' | 'file' | 'string' | 'number'; 
//   feature?: ITSFeatureKey;
//   build: (ctx: FieldContext) => Partial<ObjectDefinition | ImageDefinition | BlockDefinition | ArrayDefinition>;
//   // build: (ctx: FieldContext) => {
//   //   // We allow the build function to return ANY valid Sanity property
//   //   [key: string]: any; 
//   // };
// }
export interface CoreObject<T extends SchemaTypeDefinition = ObjectDefinition> {
  name: string;
  type?: T['type']; 
  feature?: ITSFeatureKey;
  // Build now returns the specific type T
  build: (ctx: FieldContext) => Partial<T>;
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
  defaultCountryCode?: string;
  features?: {
    shop?: {
      enabled: boolean;
      manufacturer?: boolean;
    };
    blog?: boolean;
    users?: boolean;
  };
  integrations: {
    netlify: { accessToken: string; siteId: string, projectName: string, endpoint: string, secret: string };
  };
  schemaExtensions?: Record<string, SchemaExtension>;
  documents?: CoreDocument[];
  objects?: CoreObject[];
  structure?: ITSStructureItem[];
}

/** Internal version of the config used by the engine **/
export interface CoreBackConfig extends Omit<ItsshopsConfig, 'features' | 'defaultCountryCode'> {
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
    countries: Array<{ title: Record<string, string>, value: string, isDefault?: boolean }>;
  };
  defaultCountryCode: string;
  shop: {
    productTypes: {
      product: number;
      variant: number;
      bundle: number;
    }
  };
  features: {
    shop: {
      enabled: boolean;
      manufacturer: boolean;
    };
    blog: boolean;
    users: boolean;
  };
  apiVersion: string;
}