import { ITSSchemaDefinition } from '../../../types'

/**
 * Snapshot of the boxes an order is packed in: `quantity` × a box with `packSize` places, for the
 * bottle sizes in `volumes` (the packaging group's sizes at order time). Orders before core-back
 * 4.0.0 carry a single `volume` instead of `volumes`.
 */
export const fulfillmentPackagingLine: ITSSchemaDefinition = {
  name: 'fulfillmentPackagingLine',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f, builders } = ctx
    return {
      fields: [
        f('volumes', 'array', { of: [{ type: 'number' }] }),
        f('volume', 'number', { hidden: ({ value }) => value === undefined }),
        f('packSize', 'number'),
        f('quantity', 'number'),
        builders.priceField({}),
      ],
      preview: {
        select: {
          volumes: 'volumes',
          volume: 'volume',
          packSize: 'packSize',
          quantity: 'quantity',
          price: 'price',
        },
        prepare({ volumes, volume, packSize, quantity, price }) {
          const sizes = ((volumes as number[] | undefined) ?? (volume ? [volume] : []))
            .map((v) => ctx.format.number(v / 1000, { style: 'unit', unit: 'liter' }))
            .join(' / ')
          return {
            title: quantity && packSize ? `${quantity}× ${packSize}-pack` : '—',
            subtitle: [sizes || null, price ? ctx.format.currency(price / 100) : null]
              .filter(Boolean)
              .join(' · '),
          }
        },
      },
    }
  },
}
