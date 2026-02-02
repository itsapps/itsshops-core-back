import { ITSSchemaDefinition } from '../../types';
import { PriceInput } from '../../components/PriceInput';
import {UserIcon} from '@sanity/icons'
import { Package } from 'phosphor-react'

export const shippingRate: ITSSchemaDefinition = {
  name: 'shippingRate',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx;
    return {
      icon: Package,
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
          amount: 'amount'
        },
        prepare({ title, amount }) {
          return {
            title: `${ctx.localizer.value(title)} - ${ctx.format.currency(amount/100)}`,
          }
        },
      }
    }
  },
}
