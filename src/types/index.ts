
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

import { ComponentType, ReactNode } from 'react';
import {
  ArrayOfType,
  ReferenceTo,
  ImageOptions,
  SchemaTypeDefinition,
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
  ObjectField,
  BaseSchemaDefinition,
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
  allDocs: ITSSchemaDefinition[];
  getDoc: (name: string) => ITSSchemaDefinition | undefined;
  getEnabledDocs: () => ITSSchemaDefinition[];
  isDocEnabled: (name: string) => boolean;
  allObjects: ITSSchemaDefinition[];
  getObject: (name: string) => ITSSchemaDefinition | undefined;
  getEnabledObjects: () => ITSSchemaDefinition[];
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
export interface CoreObject {
  name: string;
  feature?: ITSFeatureKey;
  // Build now returns the specific type T
  build: (ctx: FieldContext) => Partial<
    ObjectDefinition
    // ObjectDefinition | ImageDefinition | BlockDefinition | ArrayDefinition | ReferenceDefinition
  >;
}

export interface ITSObject {
  name: string;
  feature?: ITSFeatureKey;
  // Build now returns the specific type T
  fields: (ctx: FieldContext) => FieldDefinition[];
}



// interface ITSEngineMeta {
//   feature?: ITSFeatureKey;
//   // We keep 'type' here as the discriminant
//   type: 'document' | 'object' | 'array' | 'image';
// }
// 2. Create the "Shared Root"
// We Omit 'type' from BaseSchemaDefinition because we want to control 
// it strictly as a string literal ('document', etc.)
// interface ITSBaseDefinition extends Omit<BaseSchemaDefinition, 'type'>, ITSEngineMeta {}

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
  disallowedActions?: string[];
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

// type SanityBaseProps = 'name' | 'title' | 'type';
// interface ITSBaseDefinition {
//   name: string;
//   feature?: ITSFeatureKey;
//   title?: string; // Optional: falls back to translation key
// }
// export interface ITSDocumentDefinition extends ITSBaseDefinition {
//   type: 'document'; // The Discriminant
//   isSingleton?: boolean;
//   allowCreate?: boolean;
//   disallowedActions?: SanityDefinedAction[];
//   build: (ctx: FieldContext) => Omit<DocumentDefinition, SanityBaseProps>;
// }
// export interface ITSObjectDefinition extends ITSBaseDefinition {
//   type: 'object';
//   build: (ctx: FieldContext) => Omit<ObjectDefinition, SanityBaseProps>; // Must return 'fields'
// }
// export interface ITSArrayDefinition extends ITSBaseDefinition {
//   type: 'array';
//   build: (ctx: FieldContext) => Omit<ArrayDefinition, SanityBaseProps>; // Must return 'of'
// }
// export interface ITSImageDefinition extends ITSBaseDefinition {
//   type: 'image';
//   build: (ctx: FieldContext) => Omit<ImageDefinition, SanityBaseProps>; // Must return 'fields'
// }
// export type ITSSchemaDefinition = 
//   | ITSObjectDefinition 
//   | ITSArrayDefinition
//   | ITSImageDefinition
//   | ITSDocumentDefinition;




// export interface ITSBaseSchemaDefinition extends BaseSchemaDefinition {
//   feature?: ITSFeatureKey;
// }

interface ITSFieldsBuilder {
  fields: (ctx: FieldContext) => FieldDefinition[];
}
interface ITSGroupsBuilder {
  groups?: FieldGroupDefinition[] | ((ctx: ITSContext) => FieldGroupDefinition[]);
}
interface ITSFieldsetsBuilder {
  fieldsets?: FieldsetDefinition[] | ((ctx: ITSContext) => FieldsetDefinition[]);
}
interface ITSPreviewBuilder {
  preview?: (ctx: ITSContext) => PreviewConfig;
}
interface ITSObjectBuilder extends 
  Omit<ObjectDefinition, 'groups' | 'fieldsets' | 'fields' | 'preview'>,
  ITSGroupsBuilder,
  ITSFieldsetsBuilder,
  ITSFieldsBuilder,
  ITSPreviewBuilder {}

export interface ITSObjectDefinition2 extends ITSObjectBuilder {
  feature?: ITSFeatureKey;
  // groups?: FieldGroupDefinition[] | ((ctx: ITSContext) => FieldGroupDefinition[]);
  // fieldsets?: FieldsetDefinition[] | ((ctx: ITSContext) => FieldsetDefinition[]);
  // fields: (ctx: FieldContext) => FieldDefinition[];
  // preview?: (ctx: ITSContext) => PreviewConfig;
}
export type ITSCusObjectDefinition = Omit<ITSObjectBuilder, 'feature'>;

interface ITSImageBuilder extends 
  Omit<ImageDefinition, 'fields' | 'preview'>,
  ITSFieldsBuilder,
  ITSPreviewBuilder {}

export interface ITSImageDefinition2 extends ITSImageBuilder {
  feature?: ITSFeatureKey;
  // fields: (ctx: FieldContext) => FieldDefinition[];
}
export type ITSCusImageDefinition = Omit<ITSImageBuilder, 'feature'>;

// export interface ITSImageDefinition extends Omit<ImageDefinition, 'type' | 'fields'> {
//   feature?: ITSFeatureKey;
//   // fields: (ctx: FieldContext) => FieldDefinition[];
// }

export interface ITSDocumentDefinition2 extends ITSObjectDefinition {
  isSingleton?: boolean;
  allowCreate?: boolean;
  disallowedActions?: SanityDefinedAction[];
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
  documents?: ITSSchemaDefinition[];
  objects?: ITSSchemaDefinition[];
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