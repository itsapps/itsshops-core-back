import { TruckIcon as Icon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

/**
 * "Versand & Zahlung": an editor-written payment text (Stripe decides the methods, not Sanity —
 * the text must match what's enabled there), then the shipping methods (countries, rates,
 * packaging, delivery time) and the harmonised warranty notice — from the same data the checkout
 * calculates with.
 */
export const shippingInfoModule: ITSSchemaDefinition = {
  name: 'shippingInfoModule',
  type: 'object',
  icon: Icon,
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx
    return {
      ...ctx.builders.module({ fields: [f('paymentInfo', 'i18nText')] }),
      preview: {
        prepare: () => ({ title: ctx.t.default('shippingInfoModule.title'), media: Icon }),
      },
    }
  },
}
