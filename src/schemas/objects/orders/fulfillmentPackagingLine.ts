import { ITSSchemaDefinition } from '../../../types'

export const fulfillmentPackagingLine: ITSSchemaDefinition = {
  name: 'fulfillmentPackagingLine',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f, builders } = ctx
    return {
      fields: [
        f('volume', 'number'),
        f('packSize', 'number'),
        f('quantity', 'number'),
        builders.priceField({}),
      ],
      preview: {
        select: { volume: 'volume', packSize: 'packSize', quantity: 'quantity', price: 'price' },
        prepare({ volume, packSize, quantity, price }) {
          return {
            title: quantity && packSize ? `${quantity}× ${packSize}-pack` : '—',
            subtitle: [
              volume ? `${volume} ml` : null,
              price ? ctx.format.currency(price / 100) : null,
            ]
              .filter(Boolean)
              .join(' · '),
          }
        },
      },
    }
  },
}
