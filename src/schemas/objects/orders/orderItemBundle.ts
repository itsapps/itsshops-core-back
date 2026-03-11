import { ITSSchemaDefinition } from '../../../types'

export const orderItemBundle: ITSSchemaDefinition = {
  name: 'orderItemBundle',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('itemCount', 'number', {
          description: 'Total quantity of all child items combined',
          validation: (rule) => rule.required().positive().integer(),
        }),
      ],
      preview: {
        select: {
          itemCount: 'itemCount',
        },
        prepare({ itemCount }) {
          return {
            title: ctx.schemaT.default('orderItemBundle.preview.title', 'Bundle', {
              count: itemCount ?? 0,
            }),
          }
        },
      },
    }
  },
}
