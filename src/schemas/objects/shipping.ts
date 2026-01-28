import { CoreObject, FieldContext } from '../../types';
import { PriceInput } from '../../components/PriceInput';

export const shipping: CoreObject = {
  name: 'shipping',
  type: 'object',
  build: (ctx: FieldContext) => {
    const { f } = ctx;
    return {
      fieldsets: [
        {
          name: 'shippingRate',
          title: ctx.helpers.t.default('shipping.fieldsets.rate'),
          options: { collapsed: true, collapsible: true },
          // Instead of global useAdminUI, use your config features
          // hidden: config.features.shippingDetailsHidden, 
        },
      ],
      fields: [
        f('address', 'address', {
          options: {
            collapse: true,
            collapsible: true,
          },
          validation: (Rule: any) => Rule.required()
        }),
        f('shippingCountry', 'reference', {
          to: [{ type: 'shippingCountry' }],
          weak: true,
          fieldset: 'shippingRate',
          readOnly: true,
          hidden: true,
        }),
        f('rateId', 'string', {
          fieldset: 'shippingRate',
          readOnly: true,
          hidden: true,
          validation: (Rule: any) => Rule.required()
        }
        ),
        f('rateTitle', 'string', {
          fieldset: 'shippingRate',
          readOnly: true,
          validation: (Rule: any) => Rule.required()
        }),
        f('rateCost', 'number', {
          fieldset: 'shippingRate',
          components: { input: PriceInput },
          readOnly: true,
          validation: (Rule: any) => Rule.required()
        }),
      ],
    }
  },
}
