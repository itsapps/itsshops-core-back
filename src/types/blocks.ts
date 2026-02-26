import {
  BlockAnnotationDefinition,
  BlockDecoratorDefinition,
  BlockDefinition,
  BlockStyleDefinition,
} from 'sanity'

import type { WithOptionalTitle } from './utils'

export type ITSBlockStyleInput = WithOptionalTitle<BlockStyleDefinition>
export type ITSBlockDecoratorInput = WithOptionalTitle<BlockDecoratorDefinition>
export type ITSBlockAnnotationInut = WithOptionalTitle<BlockAnnotationDefinition>

export interface ITSBlockMarksInput {
  decorators?: ITSBlockDecoratorInput[]
  annotations?: BlockDefinition['marks'] extends infer M
    ? M extends { annotations?: infer A }
      ? A
      : never
    : never
}

export type ITSBlockDefinitionBase = Omit<BlockDefinition, 'styles' | 'marks'>
export interface ITSBlockDefinition extends ITSBlockDefinitionBase {
  styles?: ITSBlockStyleInput[]
  marks?: ITSBlockMarksInput
}

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

// export interface ITSBlockStyleInput {
//   value: string
//   title?: string
// }

// export interface ITSBlockDecoratorInput {
//   value: string
//   title?: string
//   icon?: React.ComponentType
// }
