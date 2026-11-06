import { ITSSchemaDefinition } from '../../../types'

/**
 * Snapshot of one bundle item on an order line (`orderItemBundle.items`). Plain strings, no
 * references — deleting a variant never breaks an order. Written by checkout; never recomputed.
 */
export const orderItemBundleItem: ITSSchemaDefinition = {
  name: 'orderItemBundleItem',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx
    const readOnly = !ctx.config.isDev
    return {
      fields: [
        f('variantId', 'string', { validation: (rule) => rule.required(), readOnly }),
        f('productId', 'string', { validation: (rule) => rule.required(), readOnly }),
        f('title', 'string', { validation: (rule) => rule.required(), readOnly }),
        f('subtitle', 'string', { readOnly }),
        f('sku', 'string', { readOnly }),
        // Per bundle (not × the line's quantity)
        f('quantity', 'number', {
          validation: (rule) => rule.required().min(1).integer(),
          readOnly,
        }),
        // Gross share of ONE bundle for all `quantity` units together (not per unit, unlike
        // orderItem.price): the bundle price split by the items' single sale prices.
        f('price', 'number', { validation: (rule) => rule.required().min(0).integer(), readOnly }),
        f('vatRate', 'number', { validation: (rule) => rule.required().min(0), readOnly }),
        // VAT in price × the line's quantity
        f('vatAmount', 'number', {
          validation: (rule) => rule.required().min(0).integer(),
          readOnly,
        }),
      ],
      preview: {
        select: {
          title: 'title',
          subtitle: 'subtitle',
          quantity: 'quantity',
          price: 'price',
          vatRate: 'vatRate',
        },
        prepare({ title, subtitle, quantity, price, vatRate }) {
          const priceStr = typeof price === 'number' ? ctx.format.currency(price / 100) : null
          return {
            title: `${quantity ?? 0}× ${title ?? ''}`,
            subtitle: [subtitle, priceStr, typeof vatRate === 'number' ? `${vatRate} %` : null]
              .filter(Boolean)
              .join(' · '),
          }
        },
      },
    }
  },
}
