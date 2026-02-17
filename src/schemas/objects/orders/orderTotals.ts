import { ITSSchemaDefinition } from '../../../types';
import { Calculator } from 'phosphor-react';

export const orderTotals: ITSSchemaDefinition = {
  name: 'orderTotals',
  type: 'object',
  feature: 'shop',
  icon: Calculator,
  build: (ctx) => {
    const { f } = ctx;

    return {
      fields: [
        // --- High Level Totals ---
        f('grandTotal', 'number', {
          title: 'Grand Total (Gross)',
          description: 'The final amount the customer paid',
          validation: (Rule) => Rule.required().precision(2),
        }),
        f('subtotal', 'number', {
          title: 'Items Subtotal',
          description: 'Sum of all order items (Gross)',
          validation: (Rule) => Rule.required(),
        }),
        f('shipping', 'number', {
          title: 'Shipping/Fulfillment Cost',
          validation: (Rule) => Rule.required(),
        }),
        f('discount', 'number', {
          initialValue: 0,
        }),
        f('totalVat', 'number', {
          title: 'Total VAT Amount',
          description: 'The sum of all VAT from items and shipping',
          validation: (Rule) => Rule.required(),
        }),

        // --- The Audit Trail (Crucial for Austria/EU) ---
        f('vatBreakdown', 'array', {
          title: 'VAT Breakdown',
          description: 'Taxes grouped by rate (e.g., 10% vs 20%)',
          of: [{ type: 'vatBreakdownItem' }]
        }),
        
        f('currency', 'string', {
          initialValue: 'EUR',
          options: { list: [{value: 'EUR'}] }
        }),
      ],
    };
  }
};