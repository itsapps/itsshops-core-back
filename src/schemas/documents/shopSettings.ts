import { ITSDocumentDefinition } from "../../types";
import { Package } from 'phosphor-react'


export const shopSettings: ITSDocumentDefinition = {
  name: 'shopSettings',
  type: 'document',
  icon: Package,
  feature: 'shop',
  isSingleton: true,
  build: (ctx) => {
    const { f } = ctx;

    const groups = ['shipping', 'stock', 'tax', 'orders', 'bankAccount' ].map((name, index) => ({
      name, ...index === 0 && { default: true }
    }));

    const fieldsMap: Record<string, any[]> = {
      shipping: [
        f('defaultCountry', 'reference', {
          to: [{ type: 'taxCountry' }],
        }),
        
        f('freeShippingCalculation', 'string', {
          options: {
            list: [
              { value: 'beforeDiscount' },
              { value: 'afterDiscount' },
            ]
          },
          initialValue: 'afterDiscount',
          // validation: (Rule) => Rule.required()
        }),
      ],
      stock: [
        f('stockThreshold', 'number', { validation: (Rule) => Rule.positive(), group: 'stock' }),
      ],
      tax: [
        f('defaultTaxCategory', 'reference', {
          to: [{ type: 'taxCategory' }],
        })
      ],
      orders: [
        f('orderNumberPrefix', 'string'),
        f('invoiceNumberPrefix', 'string'),
        f('lastInvoiceNumber', 'number', {
          validation: (rule) => rule.required().positive(),
          initialValue: 0,
        }),
      ],
      bankAccount: [
        f('bankAccount', 'bankAccount'),
      ],
    }
    const fields = groups.map(({ name }) => ([
      ...fieldsMap[name].map(field => ({ ...field, group: name }))
    ])).flat();

    return {
      groups,
      fields,
    }
  }
};
