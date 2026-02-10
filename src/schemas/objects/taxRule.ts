import { ITSSchemaDefinition } from '../../types';
import { PriceInput } from '../../components/PriceInput';
import {UserIcon} from '@sanity/icons'
import { Package } from 'phosphor-react'

export const taxRule: ITSSchemaDefinition = {
  name: 'taxRule',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('taxCategory', 'reference', {
          to: [{ type: 'taxCategory' }],
          validation: (Rule) => Rule.required(),
        }),
        f('rate', 'number', {
          validation: (Rule) => Rule.required().positive().max(100),
        }),
        f('exciseDuty', 'number'),
      ],
      preview: {
        select: {
          title: 'taxCategory.title',
          rate: 'rate'
        },
        prepare({ title, rate }) {
          return {
            title: `${ctx.localizer.value(title) || 'New Rule'}: ${rate || '-'}%`,
          }
        },
      }
    }
  },
}
