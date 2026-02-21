import type { WithOptionalTitle } from './utils';

import {
  ArrayOfType,
  ReferenceTo,
  DocumentDefinition,
  ArrayDefinition,
  ReferenceDefinition,
  // BlockDefinition,
  // NumberDefinition,
  ImageDefinition,
  ObjectDefinition,
  FieldDefinition,
  FieldGroupDefinition,
  FieldsetDefinition,
  Rule,
  PreviewConfig,
  DocumentActionComponent,
  TFunction,
  // ReferenceOptions,
  SanityClient,
  Template,
  BlockDefinition,
  BlockStyleDefinition,
  BlockMarksDefinition,
  BlockAnnotationDefinition,
  BlockDecoratorDefinition,
  defineArrayMember
} from 'sanity';


export type ITSBlockStyleInput = WithOptionalTitle<BlockStyleDefinition>;
export type ITSBlockDecoratorInput = WithOptionalTitle<BlockDecoratorDefinition>;
export type ITSBlockAnnotationInut = WithOptionalTitle<BlockAnnotationDefinition>;
// export interface ITSBlockMarksDefinition {
//   decorators?: ITSBlockDecorator[];
//   annotations?: ITSBlockAnnotation[];
// }
// export interface ITSBlockOptions {
//   styles?: ITSBlockStyle[],
//   marks?: ITSBlockMarksDefinition
// }

// type Bla = ArrayDefinition
// export type ITSArrayBlock = Bla & {
//   styles?: ITSBlockStyle[],
//   marks?: ITSBlockMarksDefinition
// }
// export interface ITSArrayOfType extends Omit<ArrayOfType<'block'>, 'styles' | 'marks'> {
//   styles?: ITSBlockStyle[],
//   marks?: ITSBlockMarksDefinition
// }
// export type ITSBuilderBlock = (
//   partial: ITSArrayOfType,
//   options: {
//     name?: string
//   }
// ) => ArrayOfType<'block'>

export type ITSBlockBase = Omit<
  BlockDefinition,
  // Parameters<typeof defineArrayMember>[0],
  'styles' | 'marks'
>

// export interface ITSBlockStyleInput {
//   value: string
//   title?: string
// }

// export interface ITSBlockDecoratorInput {
//   value: string
//   title?: string
//   icon?: React.ComponentType
// }

export interface ITSBlockMarksInput {
  decorators?: ITSBlockDecoratorInput[]
  annotations?: BlockDefinition['marks'] extends infer M
    ? M extends { annotations?: infer A }
      ? A
      : never
    : never
}

export interface ITSBuilderBlockOptions extends ITSBlockBase {
  styles?: ITSBlockStyleInput[]
  marks?: ITSBlockMarksInput
}
