import { VatBreakdownIcon } from '../../../assets/icons'
import { ITSSchemaDefinition } from '../../../types'

export const vatBreakdownItem: ITSSchemaDefinition = {
  name: 'vatBreakdownItem',
  type: 'object',
  feature: 'shop',
  icon: VatBreakdownIcon,
  build: (ctx) => {
    const { f } = ctx

    return {
      fields: [
        f('rate', 'number'),
        ctx.builders.priceField({
          name: 'net',
          validation: (rule) => rule.required().min(0).integer(),
        }),
        ctx.builders.priceField({
          name: 'vat',
          validation: (rule) => rule.required().min(0).integer(),
        }),
      ],
    }
  },
}
