import { PackageIcon } from '@phosphor-icons/react'

import { ITSSchemaDefinition } from '../../types'

export const taxRule: ITSSchemaDefinition = {
  name: 'taxRule',
  type: 'object',
  icon: PackageIcon,
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx
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
          rate: 'rate',
        },
        prepare({ title, rate }) {
          return {
            title: `${ctx.localizer.value(title) || 'New Rule'}: ${rate || '-'}%`,
            media: PackageIcon,
          }
        },
      },
    }
  },
}
