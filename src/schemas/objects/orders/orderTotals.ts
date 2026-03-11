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
          title: 'Grand Total (Gross)',
          description: 'The final amount the customer paid',
          validation: (rule) => rule.required().min(0).integer(),
        }),
        f('subtotal', 'number', {
          title: 'Items Subtotal',
          description: 'Sum of all order items (Gross)',
          validation: (rule) => rule.required().min(0).integer(),
        }),
        f('shipping', 'number', {
          title: 'Shipping/Fulfillment Cost',
          validation: (rule) => rule.required().min(0).integer(),
        }),
        f('discount', 'number', {
          initialValue: 0,
          validation: (rule) => rule.required().min(0).integer(),
        }),
        f('totalVat', 'number', {
          title: 'Total VAT Amount',
          description: 'The sum of all VAT from items and shipping',
          validation: (rule) => rule.required().min(0).integer(),
        }),

        // --- The Audit Trail (Crucial for Austria/EU) ---
        f('vatBreakdown', 'array', {
          title: 'VAT Breakdown',
          description: 'Taxes grouped by rate (e.g., 10% vs 20%)',
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
