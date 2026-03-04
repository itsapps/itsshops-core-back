import { ComponentType, ReactNode } from 'react'
import type {
  ArrayDefinition,
  ArrayOfType,
  DocumentActionComponent,
  DocumentDefinition,
  FieldDefinition,
  FieldGroupDefinition,
  FieldsetDefinition,
  ImageDefinition,
  ObjectDefinition,
  PreviewConfig,
  Reference,
  ReferenceDefinition,
  ReferenceTo,
  Rule,
  SanityDocument,
  SanityDocumentLike,
  Template,
} from 'sanity'
import { ListItemBuilder, StructureBuilder, StructureResolverContext } from 'sanity/structure'

import { FieldContext, ITSContext } from './context'
import { PriceOptions } from './fields'
import { FieldTranslators, I18nValidationOptions, ITSi18nArray, LocaleImage } from './localization'

export type ITSSanityDefinedAction = NonNullable<DocumentActionComponent['action']>

export type ITSFeatureKey =
  | 'shop'
  | 'shop.manufacturer'
  | 'shop.stock'
  | 'shop.category'
  | 'shop.vinofact'
  | 'blog'
  | 'users'

interface ITSBaseDefinition {
  name: string
  feature?: ITSFeatureKey
  title?: string
  description?: string
  icon?: ComponentType | ReactNode
}

type DefinitionOmits = 'name' | 'type' | 'title' | 'icon'

export interface ITSDocumentDefinition extends ITSBaseDefinition {
  type: 'document'
  isSingleton?: boolean
  hideInStructure?: boolean
  allowCreate?: boolean
  disallowedActions?: ITSSanityDefinedAction[]
  getInitialValue?: (ctx: ITSContext) => Template
  build: (ctx: FieldContext) => Omit<DocumentDefinition, DefinitionOmits>
}
export interface ITSObjectDefinition extends ITSBaseDefinition {
  type: 'object'
  build: (ctx: FieldContext) => Omit<ObjectDefinition, DefinitionOmits>
}
export interface ITSArrayDefinition extends ITSBaseDefinition {
  type: 'array'
  build: (ctx: FieldContext) => Omit<ArrayDefinition, DefinitionOmits>
}
export interface ITSImageDefinition extends ITSBaseDefinition {
  type: 'image'
  build: (ctx: FieldContext) => Omit<ImageDefinition, DefinitionOmits>
}
export type ITSSchemaDefinition =
  | ITSDocumentDefinition
  | ITSObjectDefinition
  | ITSArrayDefinition
  | ITSImageDefinition

export interface SchemaExtension {
  icon?: ComponentType
  groups?: FieldGroupDefinition[] | ((ctx: ITSContext) => FieldGroupDefinition[])
  removeGroups?: string[]
  fieldsets?: FieldsetDefinition[] | ((ctx: ITSContext) => FieldsetDefinition[])
  fields?: (ctx: FieldContext) => FieldDefinition[]
  // fieldOverrides?: Record<string, CoreFieldOptions> | ((ctx: FieldContext) => Record<string, CoreFieldOptions>);
  fieldOverrides?:
    | Record<string, Partial<FieldDefinition>>
    | ((ctx: FieldContext) => Record<string, Partial<FieldDefinition>>)
  preview?: (ctx: ITSContext) => PreviewConfig
  order?: string[]
}

export type ITSStructureComponent = (
  S: StructureBuilder,
  context: StructureResolverContext,
  ctx: ITSContext,
) => ListItemBuilder

export interface ITSStructureItem {
  type: 'document' | 'singleton' | 'group' | 'divider' | 'custom'
  id: string
  title?: string
  icon?: ComponentType | ReactNode
  hidden?: boolean
  feature?: ITSFeatureKey
  children?: ITSStructureItem[]
  component?: ITSStructureComponent
  // Positioning logic:
  position?: {
    anchor?: 'top' | 'bottom' | string
    placement?: 'before' | 'after'
  }
}

export type CoreFieldOptions = Omit<Partial<FieldDefinition>, 'validation' | 'to' | 'of'> & {
  i18n?: I18nValidationOptions
  validation?: (rule: Rule) => any
  to?: ReferenceTo[]
  of?: ArrayOfType[]
  [key: string]: any
}

export type ReferenceFieldBuilder = (
  name: string,
  options: Omit<ReferenceDefinition, 'name' | 'type'>,
) => FieldDefinition<'reference'>

export type FieldFactory = (
  fieldName: string,
  type?: string,
  overrides?: CoreFieldOptions,
) => FieldDefinition

export type CoreFactory = {
  fields: FieldFactory
  fieldTranslators: FieldTranslators
  reference: (
    name: string,
    options: Omit<ReferenceDefinition, 'name' | 'type'>,
  ) => FieldDefinition<'reference'>
}

export interface ITSInternalLinkOptions {
  name?: string
  to?: string[]
  includeTitle?: boolean
  includeDisplayType?: boolean
  displayTypes?: string[]
  required?: boolean
}

export interface ITSExternalLinkOptions {
  name?: string
  // to?: string[]
  // includeTitle?: boolean
  // includeDisplayType?: boolean
  // displayTypes?: string[]
  required?: boolean
}

export interface ITSModuleOptions {
  fields: any[]
  allowAnchor?: boolean
  allowTheme?: boolean
}

export interface ITSPTOptions {
  name?: string
  allowLinks?: boolean
  styles?: string[]
}
export interface ITSActionGroupOptions {
  name?: string
  max?: number
}

export interface ITSCountryCodeOptions {
  name?: string
  documentType: string
}
export interface ITSCountryCodesOptions {
  name?: string
  documentType: string
}

export type GroupFieldsInput = FieldGroupDefinition & {
  fields: FieldDefinition[]
}
export type GroupFieldsOutput = {
  groups: FieldGroupDefinition[]
  fields: FieldDefinition[]
}

export interface ITSBuilders {
  externalLink: (options?: ITSExternalLinkOptions) => FieldDefinition[]
  internalLink: (options?: ITSInternalLinkOptions) => FieldDefinition[]
  module: (options: ITSModuleOptions) => any
  // portableText: (options?: ITSPTOptions) => any;
  // portableText: (options?: ITSPTOptions) => Partial<ArrayDefinition>;
  // block: (options: ITSBlockOptions) => ArrayOfType<'block'>
  // block: (options: ITSArrayBlock) => ArrayOfType<'block'>;
  portableText: (options?: ITSPTOptions) => Pick<ArrayDefinition, 'of'>
  actionGroup: (options: ITSActionGroupOptions) => any
  countryCodeField: (options: ITSCountryCodeOptions) => FieldDefinition
  countryCodesField: (options: ITSCountryCodesOptions) => FieldDefinition
  priceField: (options: PriceOptions) => FieldDefinition<'number'>
  defineArrayField(props: Omit<ArrayDefinition, 'type'>): ArrayDefinition
  buildGroupedSchema: (props: GroupFieldsInput[]) => GroupFieldsOutput
}

export type DocumentReference = {
  _type: string
  _ref: string
}

export interface SanityImageWithHotspot {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export type VariantOption = {
  _id: string
  title: ITSi18nArray
  sortOrder?: number
}

export type VariantOptionGroup = {
  _id: string
  title: ITSi18nArray
  sortOrder: number
  options: VariantOption[]
}

export type Variant = SanityDocument & {
  _id: string
  _rev: string
  options: VariantOption[]
  title: ITSi18nArray
  featured: boolean
  price?: number
  coverImage: string
  sku?: string
  active: boolean
  images?: LocaleImage[]
}

export type NewVariant = SanityDocumentLike & {
  _id: string
  _type: string
  title: ITSi18nArray
  sku?: string
  options: Reference[]
  featured: boolean
  active: boolean
  price?: number
}

export type Product = SanityDocument & {
  images?: LocaleImage[]
  price?: number
  sku?: string
  title: ITSi18nArray
}

export type VariantContainer = {
  _id: string
  published: Variant
  draft?: Variant
}
