import type { DocumentDefinition } from 'sanity'
import type {
  ItsshopsFieldDefinition,
  ItsshopsFieldGroup,
  ItsshopsSchemaTypeDefinition,
  TranslatorFunction
} from '../types/schema'


export function createSchema(
  schema: ItsshopsSchemaTypeDefinition,
  translator: TranslatorFunction,
): DocumentDefinition {
  const fields = schema.fields as ItsshopsFieldDefinition[]
  const groups = schema.groups as ItsshopsFieldGroup[] | undefined

  const translate = (key: string, useKeyAsDefault = false) => {
    return translator(`${schema.name}.${key}`, useKeyAsDefault)
  }
  return {
    ...schema,
    title: translate(`title`),
    description: translate(`description`, false),
    ...groups && groups.toSorted((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((group) => {
      const description = translate(`groups.${group.name}.description`, false)
      const { sortOrder, ...g} = group
      return {
        ...g,
        title: translate(`groups.${group.name}.title`),
        ...description && {description},
      }
    }),
    fields: fields.toSorted((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((field) => {
      const description = translate(`fields.${field.name}.description`, false)
      const { sortOrder, ...f} = field
      return {
        ...f,
        title: translate(`fields.${field.name}.title`),
        ...description && {description},
      }
    }),
    // preview: {
    //   select: {
    //     title: 'title',
    //     amount: 'amount'
    //   },
    //   prepare({ title, amount }) {
    //     return {
    //       title: `${localizedValue(title, language.id)} - ${localizeMoney(amount/100, language.id)}`,
    //       // subtitle: name,
    //       // media: image
    //     }
    //   }
    // }
  }
}