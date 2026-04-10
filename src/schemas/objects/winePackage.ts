import { ITSSchemaDefinition } from '../../types'

export const winePackage: ITSSchemaDefinition = {
  name: 'winePackage',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f, builders } = ctx
    return {
      fields: [
        f('count', 'number', {
          validation: (Rule) => Rule.required().integer().min(1),
        }),
        builders.priceField({
          validation: (Rule) => Rule.required(),
        }),
      ],
      preview: {
        select: { count: 'count', price: 'price' },
        prepare({ count, price }) {
          return {
            title: count ? `${count}×` : '—',
            subtitle: price ? ctx.format.currency(price / 100) : '',
          }
        },
      },
    }
  },
}
