import { ITSSchemaDefinition } from '../../types'

export const packagingGroupPackage: ITSSchemaDefinition = {
  name: 'packagingGroupPackage',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f, builders } = ctx
    return {
      fields: [
        f('places', 'number', {
          validation: (Rule) => Rule.required().integer().min(1),
        }),
        builders.priceField({
          validation: (Rule) => Rule.required(),
        }),
      ],
      preview: {
        select: { places: 'places', price: 'price' },
        prepare({ places, price }) {
          return {
            title: places
              ? ctx.t.default('packagingGroupPackage.preview.places', `${places}`, {
                  count: places,
                })
              : '—',
            subtitle: price ? ctx.format.currency(price / 100) : '',
          }
        },
      },
    }
  },
}
