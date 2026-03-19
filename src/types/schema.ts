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
  ReferenceDefinition,
  ReferenceTo,
  Rule,
  Template,
} from 'sanity'
import { ListItemBuilder, StructureBuilder, StructureResolverContext } from 'sanity/structure'

import { ITSBlockDefinition } from './blocks'
import { FieldContext, ITSContext } from './context'
import { PriceOptions } from './fields'
import { FieldTranslators, I18nValidationOptions } from './localization'

export type ITSSanityDefinedAction = NonNullable<DocumentActionComponent['action']>

export type ITSFeatureKey =
  | 'shop'
  | 'shop.manufacturer'
  | 'shop.stock'
  | 'shop.category'
  | 'shop.vinofact'
  | 'shop.productKind.wine'
  | 'shop.productKind.physical'
  | 'shop.productKind.digital'
  | 'shop.productKind.bundle'
  | 'shop.productKind.options'
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

export type ITSStructureItemType = 'document' | 'singleton' | 'group' | 'divider' | 'custom'
export interface ITSStructureItem {
  type: ITSStructureItemType
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
  of?: (ArrayOfType | ITSBlockDefinition)[]
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
  includeTitle?: boolean
  // includeDisplayType?: boolean
  // displayTypes?: string[]
  required?: boolean
}

export interface ITSModuleOptions {
  fields: any[]
  allowAnchor?: boolean
  allowTheme?: boolean
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

export interface ITSVariantReferenceOptions {
  name?: string
  multiple?: boolean
}

export interface ITSVariantReferenceMemberOptions {
  name?: string
  icon?: ComponentType
}

export type CoreModuleName = 'carousel' | 'youtube' | 'productGrid' | 'categoryGrid'

export interface ITSBuilders {
  externalLinkFields: (options?: ITSExternalLinkOptions) => FieldDefinition[]
  internalLinkFields: (options?: ITSInternalLinkOptions) => FieldDefinition[]
  module: (options: ITSModuleOptions) => any
  /**
   * Standalone reference field (or array field) pointing to productVariant.
   * Automatically applies `disableNew` and filters out archived variants.
   * Use `multiple: true` for an array of variant references.
   */
  variantReference: (options?: ITSVariantReferenceOptions) => FieldDefinition
  /**
   * ProductVariant reference definition for use as a member inside a mixed `of` array.
   * Use when productVariant is one of several types in an array (e.g. alongside external links).
   */
  variantReferenceMember: (options?: ITSVariantReferenceMemberOptions) => ArrayOfType<'reference'>
  actionGroup: (options: ITSActionGroupOptions) => any
  countryCodeField: (options: ITSCountryCodeOptions) => FieldDefinition
  countryCodesField: (options: ITSCountryCodesOptions) => FieldDefinition
  priceField: (options: PriceOptions) => FieldDefinition<'number'>
  defineArrayField(props: Omit<ArrayDefinition, 'type'>): ArrayDefinition
  buildGroupedSchema: (props: GroupFieldsInput[]) => GroupFieldsOutput
  /**
   * Returns `ArrayOfType[]` for the requested core module names.
   * Feature-gated modules (productGrid, categoryGrid) are silently omitted
   * when the required feature is not enabled.
   */
  coreModules: (names: CoreModuleName[]) => ArrayOfType[]
}
