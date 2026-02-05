
export * from './localization';
export * from './mail';
export * from './netlify';
export * from './frontend';
export * from './orders';
export * from './schema';
export * from './vinofact';

import {
  I18nValidationOptions,
  Language,
  ITSTranslator,
  ITSLocalizer,
  ITSFormatter,
} from './localization';
import { ITSFrontendClient } from './frontend';
import { ITSVinofactClient } from './vinofact';

import { ComponentType, ReactNode } from 'react';
import {
  ArrayOfType,
  ReferenceTo,
  DocumentDefinition,
  ArrayDefinition,
  ReferenceDefinition,
  BlockDefinition,
  ImageDefinition,
  ObjectDefinition,
  FieldDefinition,
  FieldGroupDefinition,
  FieldsetDefinition,
  Rule, 
  PreviewConfig,
  DocumentActionComponent,
  TFunction,
  ReferenceOptions,
} from 'sanity';

export type ITSSanityDefinedAction = NonNullable<DocumentActionComponent['action']>

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

export interface ITSInternalLinkOptions {
  name?: string;
  to?: string[];
  includeTitle?: boolean;
  includeDisplayType?: boolean;
  required?: boolean;
}

export interface ITSModuleOptions {
  name: string;
  fields: any[];
  allowAnchor?: boolean;
  allowTheme?: boolean;
}

export interface ITSPTOptions {
  name?: string;
  allowLinks?: boolean;
  styles?: string[];
}
export interface ITSActionGroupOptions {
  name?: string;
  max?: number;
}

export interface ITSBuilders {
  internalLink: (options?: ITSInternalLinkOptions) => FieldDefinition[];
  module: (options: ITSModuleOptions) => any;
  // portableText: (options?: ITSPTOptions) => any;
  // portableText: (options?: ITSPTOptions) => Partial<ArrayDefinition>;
  portableText: (options?: ITSPTOptions) => Pick<ArrayDefinition, 'of'>;
  actionGroup: (options: ITSActionGroupOptions) => any;
}

export type ITSFeatureKey = 'shop' | 'shop.manufacturer' | 'shop.vinofact' | 'blog' | 'users';
export type ITSFeatureRegistry = {
  isFeatureEnabled: (name: ITSFeatureKey) => boolean;
  allSchemas: ITSSchemaDefinition[];
  getSchema: (name: string) => ITSSchemaDefinition | undefined;
  isSchemaEnabled: (name: string) => boolean;
  getDoc: (name: string) => ITSDocumentDefinition | undefined;
  getEnabledDocs: () => ITSDocumentDefinition[];
  isDocEnabled: (name: string) => boolean;
  // allObjects: ITSSchemaDefinition[];
  // getObject: (name: string) => ITSSchemaDefinition | undefined;
  // isObjectEnabled: (name: string) => boolean;
  getEnabledObjects: () => ITSSchemaDefinition[];
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
  vinofactClient?: ITSVinofactClient;
}

export interface FieldContext extends ITSContext {
  f: FieldFactory;
  builders: ITSBuilders;
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

interface ITSBaseDefinition {
  name: string;
  feature?: ITSFeatureKey;
  title?: string;
  description?: string;
  icon?: ComponentType | ReactNode
}
export interface ITSDocumentDefinition extends ITSBaseDefinition {
  type: 'document';
  isSingleton?: boolean;
  allowCreate?: boolean;
  disallowedActions?: ITSSanityDefinedAction[];
  build: (ctx: FieldContext) => Omit<DocumentDefinition, 'name' | 'type' | 'title' | 'icon'>;
}
export interface ITSObjectDefinition extends ITSBaseDefinition {
  type: 'object';
  build: (ctx: FieldContext) => Omit<ObjectDefinition, 'name' | 'type' | 'title' | 'icon'>;
}

export interface ITSArrayDefinition extends ITSBaseDefinition {
  type: 'array';
  build: (ctx: FieldContext) => Omit<ArrayDefinition, 'name' | 'type' | 'title' | 'icon'>;
}

export interface ITSImageDefinition extends ITSBaseDefinition {
  type: 'image';
  build: (ctx: FieldContext) => Omit<ImageDefinition, 'name' | 'type' | 'title' | 'icon'>;
}

export type ITSSchemaDefinition = 
  | ITSDocumentDefinition 
  | ITSObjectDefinition 
  | ITSArrayDefinition 
  | ITSImageDefinition;

export interface ITSCoreSchemaSettings {
  links: {
    allowedReferences: string[];
  };
  menus: {
    allowedReferences: string[];
    disableSubmenus: boolean;
  };
}
export type CoreSchemaSettings = ITSCoreSchemaSettings
export type SchemaSettingsInput = RecursivePartial<CoreSchemaSettings>
type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

export interface FeatureConfig {
  shop?: Partial<{
    enabled: boolean
    manufacturer?: boolean
    vinofact?: VinofactConfig
  }>
  blog?: boolean
  users?: boolean
}

export interface ITSFeatureConfig {
  shop: {
    enabled: boolean
    manufacturer: boolean
    vinofact: VinofactConfig
  }
  blog: boolean
  users: boolean
}

export interface VinofactConfig {
  enabled: boolean;
  integration?: {
    endpoint: string;
    accessToken: string;
    profileSlug: string;
  }
}

export interface I18nConfig {
  ui?: string[]
  fields?: string[]
  defaultLocale?: string
  fieldTranslationOverrides?: Record<string, any>
  structureTranslationOverrides?: Record<string, any>
  translationOverrides?: Record<string, any>
  localizedFieldTypes?: string[]
}

export interface ITSi18nConfig {
  uiLanguages: Language[]
  fieldLanguages: Language[]
  uiLocales: string[]
  fieldLocales: string[]
  defaultLocale: string
  localizedFieldTypes: string[]
  overrides: {
    fields: Record<string, any>
    structure: Record<string, any>
    general: Record<string, any>
  }
  countries: Array<{
    title: Record<string, string>,
    value: string,
    isDefault?: boolean
  }>;
}

export interface NetlifyConfig {
  accessToken: string
  siteId: string
  projectName: string
  endpoint: string
  secret: string
}
export interface IntegrationsConfig {
  netlify: NetlifyConfig
}

export interface ItsshopsConfig {
  isDev: boolean;
  projectId: string;
  dataset: string;
  workspaceName: string;
  i18n?: I18nConfig;
  defaultCountryCode?: string;
  features?: FeatureConfig;
  integrations: IntegrationsConfig;
  schemaSettings?: SchemaSettingsInput;
  schemaExtensions?: Record<string, SchemaExtension>;
  documents?: ITSSchemaDefinition[];
  objects?: ITSSchemaDefinition[];
  structure?: ITSStructureItem[];
}

/** Internal version of the config used by the engine **/
export interface CoreBackConfig extends Omit<ItsshopsConfig, 'features' | 'defaultCountryCode' | 'schemaSettings'> {
  localization: ITSi18nConfig;
  defaultCountryCode: string;
  shop: {
    productTypes: {
      product: number;
      variant: number;
      bundle: number;
    }
  };
  features: ITSFeatureConfig;
  schemaSettings: CoreSchemaSettings;
  apiVersion: string;
}