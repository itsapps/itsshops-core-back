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
        f('rate', 'number', {
          title: 'Rate %',
        }),
        f('net', 'number', {
          title: 'Net Amount',
          validation: (rule) => rule.required().min(0).integer(),
        }),
        f('vat', 'number', {
          title: 'Vat Amount',
          validation: (rule) => rule.required().min(0).integer(),
        }),
        f('label', 'string', {
          title: 'Label (e.g., "VAT 20%")',
        }),
      ],
    }
  },
}
