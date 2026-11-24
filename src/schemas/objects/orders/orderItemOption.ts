import { ITSSchemaDefinition } from '../../../types'

export const orderItemOption: ITSSchemaDefinition = {
  name: 'orderItemOption',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('groupTitle', 'string', {
          validation: (rule) => rule.required(),
        }),
        f('optionTitle', 'string', {
          validation: (rule) => rule.required(),
        }),
      ],
      preview: {
        select: {
          groupTitle: 'groupTitle',
          optionTitle: 'optionTitle',
        },
        prepare({ groupTitle, optionTitle }) {
          return {
            title: optionTitle ?? '—',
            subtitle: groupTitle ?? '—',
          }
        },
      },
    }
  },
}
