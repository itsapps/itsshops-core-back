import { type BlockDefinition } from 'sanity'

export interface Language {
  id: string
  title: string
  locale: string
  weekInfo: { firstDay: number; weekend: number[]; minimalDays: number }
}

export type TranslatorParams = Record<string, string | number | boolean>

export type TranslatorFunction = (
  key: string,
  fallback?: string,
  params?: TranslatorParams,
) => string

export type StrictTranslatorFunction = (
  key: string,
  params?: TranslatorParams,
) => string | undefined

export interface ITSTranslator {
  default: TranslatorFunction
  strict: StrictTranslatorFunction
}

export type BaseFieldTProps = {
  namespace: string
  t: ITSTranslator
}
export type FieldKeypathTProps = {
  fieldGroup: string
  fieldName: string
  attribute?: string
}
export type FieldTProps = {
  fieldGroup: string
  fieldName: string
  attribute?: string
}
export type FieldOptionProps = {
  fieldName: string
  value: string
}
export type BlockFieldProps = {
  fieldName: string
  block: BlockDefinition
}

export interface FieldTranslators {
  default: (props: FieldKeypathTProps) => string
  strict: (props: FieldKeypathTProps) => string | undefined
  option: (props: FieldOptionProps) => string
  blockStyle: (props: FieldOptionProps) => string | undefined
  block: (props: BlockFieldProps) => void
}

export interface ITSi18nDictValue<T = string> {
  [key: string]: T | undefined
}

export interface ITSi18nEntry<T = string> {
  language: string
  value?: T
}

export type ITSi18nArray<T = string> = ITSi18nEntry<T>[]
export type ITSi18nLocalizerValue = <T = string>(data: unknown) => T | undefined

export interface ITSLocalizer {
  value: ITSi18nLocalizerValue
  dictValue: ITSi18nLocalizerValue
}
export interface ITSFormatter {
  date: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string
  number: (num: number, options?: Intl.NumberFormatOptions) => string
  currency: (num: number, currency?: string) => string
  dateFormat: (dateType: 'date' | 'datetime') => { dateFormat: string; timeFormat?: string }
}

/** 2. Field Factory Types **/
export type I18nRuleShortcut =
  | 'requiredDefault'
  | 'requiredDefaultWarning'
  | 'requiredAll'
  | 'atLeastOne'
  | 'atLeastOneWarning'
  | { min?: number; max?: number; warning?: boolean }

export type I18nValidationOptions = I18nRuleShortcut | I18nRuleShortcut[]
