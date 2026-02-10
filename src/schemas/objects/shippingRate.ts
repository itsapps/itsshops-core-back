import { ITSSchemaDefinition } from '../../types';
import { Boat } from 'phosphor-react'

export const shippingRate: ITSSchemaDefinition = {
  name: 'shippingRate',
  type: 'object',
  feature: 'shop',
  icon: Boat,
  build: (ctx) => {
    const { f, builders } = ctx;
    return {
      fields: [
        f('maxWeight', 'number', {
          validation: Rule => Rule.required().min(0.1).precision(2)
        }),
        builders.priceField({
          validation: (Rule) => Rule.required(),
        }),
      ],
      preview: {
        select: {
          maxWeight: 'maxWeight',
          price: 'price',
        },
        prepare({ maxWeight, price }) {
          return {
            title: `<= ${maxWeight} kg`,
            subtitle: ctx.format.currency(price/100),
            media: Boat
          }
        },
      }
      // fields: [
      //   builders.countryField(),
      //   f('rules', 'array', {
      //     of: [{ type: 'taxRule' }],
      //   }),
      // ],
      // preview: {
      //   select: {
      //     code: 'countryCode',
      //     rules: 'rules'
      //   },
      //   prepare({ code, rules }) {
      //     return {
      //       title: code,
      //       subtitle: rules?.length,
      //     }
      //   },
      // }
    }
  },
}
