import { Package } from 'phosphor-react'
import { ITSDocumentDefinition } from "../../types";
import { shipping } from '../objects/aaa_not_used_shipping';


export const shopSettings: ITSDocumentDefinition = {
  name: 'shopSettings',
  type: 'document',
  icon: Package,
  feature: 'shop',
  isSingleton: true,
  build: (ctx) => {
    const { f } = ctx;

    const groups = ['shipping', 'stock', 'tax', ].map((name, index) => ({
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
      ]
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
