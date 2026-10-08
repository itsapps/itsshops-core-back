import { TruckIcon as Icon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

/**
 * Renders the shipping methods (countries, rates, packaging, delivery time) and the harmonised
 * warranty notice — from the same data the checkout calculates with. No content fields; payment
 * methods go into an ordinary rich-text module next to it (Stripe decides them, not Sanity).
 */
export const shippingInfoModule: ITSSchemaDefinition = {
  name: 'shippingInfoModule',
  type: 'object',
  icon: Icon,
  feature: 'shop',
  build: (ctx) => {
    return {
      ...ctx.builders.module({ fields: [] }),
      preview: {
        prepare: () => ({ title: ctx.t.default('shippingInfoModule.title'), media: Icon }),
      },
    }
  },
}
