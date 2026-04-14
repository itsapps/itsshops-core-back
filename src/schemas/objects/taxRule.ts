import { TaxRuleIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const taxRule: ITSSchemaDefinition = {
  name: 'taxRule',
  type: 'object',
  icon: TaxRuleIcon,
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
      ],
      preview: {
        select: {
          title: 'taxCategory.title',
          rate: 'rate',
        },
        prepare({ title, rate }) {
          return {
            title: ctx.localizer.value(title),
            subtitle: rate ? `${ctx.t.default('taxRule.preview.rate')}: ${rate}%` : '',
            media: TaxRuleIcon,
          }
        },
      },
    }
  },
}
