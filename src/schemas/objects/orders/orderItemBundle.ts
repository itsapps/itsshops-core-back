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
          validation: (rule) => rule.required().positive().integer(),
        }),
        // Contents + VAT split (written by checkout from 2026-11; older orders have none)
        f('items', 'array', {
          of: [{ type: 'orderItemBundleItem' }],
          readOnly: !ctx.config.isDev,
          options: {
            ...(!ctx.config.isDev && {
              disableActions: ['add', 'duplicate', 'addBefore', 'addAfter', 'copy', 'remove'],
            }),
            sortable: false,
          },
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
