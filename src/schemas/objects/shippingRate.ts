import { ITSContext, CoreObject, FieldContext } from '../../types';
import { PriceInput } from '../../components/PriceInput';

export const shippingRate: CoreObject = {
  name: 'shippingRate',
  type: 'object',
  feature: 'shop',
  build: (ctx: FieldContext) => {
    const { f } = ctx;
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('amount', 'number', {
          components: { input: PriceInput },
          validation: (Rule: any) => Rule.required()
        }),
        f('trackingUrl', 'url'),
      ],
      preview: {
        select: {
          title: 'title',
        },
        prepare(s: any) {
          const { title } = s
          return {
            title: ctx.localizer.value(title),
          }
        },
      }
    }
  },
}
