import type { DocumentDefinition, FieldGroup, FieldsetDefinition, FieldDefinition, Rule } from 'sanity'

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
  [key: string]: any;
};

export type FieldFactory = (
  fieldName: string, 
  type?: string, 
  overrides?: CoreFieldOptions
) => any;

export type ItsshopsFieldGroup = FieldGroup & {
  sortOrder?: number
}
export type ItsshopsFieldDefinition = FieldDefinition & {
  sortOrder?: number
}
export type ItsshopsFieldsetDefinition = FieldsetDefinition & {
  sortOrder?: number
}
export type ItsshopsSchemaTypeDefinition = Omit<DocumentDefinition, 'description' | 'groups' | 'fieldsets'> & {
  fields: ItsshopsFieldDefinition[]
  groups?: ItsshopsFieldGroup[]
  fieldsets?: ItsshopsFieldsetDefinition[]
}
