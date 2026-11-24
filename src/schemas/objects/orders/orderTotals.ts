import { OrderTotalsIcon } from '../../../assets/icons'
import { ITSSchemaDefinition } from '../../../types'

export const orderTotals: ITSSchemaDefinition = {
  name: 'orderTotals',
  type: 'object',
  feature: 'shop',
  icon: OrderTotalsIcon,
  build: (ctx) => {
    const { f } = ctx

    return {
      fields: [
        // --- High Level Totals ---
        f('grandTotal', 'number', {
          validation: (rule) => rule.required().min(0).integer(),
        }),
        f('subtotal', 'number', {
          validation: (rule) => rule.required().min(0).integer(),
        }),
        f('shipping', 'number', {
          validation: (rule) => rule.required().min(0).integer(),
        }),
        f('discount', 'number', {
          initialValue: 0,
          validation: (rule) => rule.required().min(0).integer(),
        }),
        f('totalVat', 'number', {
          validation: (rule) => rule.required().min(0).integer(),
        }),

        // --- The Audit Trail (Crucial for Austria/EU) ---
        f('vatBreakdown', 'array', {
          of: [{ type: 'vatBreakdownItem' }],
        }),

        f('currency', 'string', {
          initialValue: 'EUR',
          options: { list: [{ value: 'EUR' }] },
        }),
      ],
    }
  },
}
