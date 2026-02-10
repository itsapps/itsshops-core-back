import { Package } from 'phosphor-react'
import { ITSDocumentDefinition } from "../../types";


export const shopSettings: ITSDocumentDefinition = {
  name: 'shopSettings',
  type: 'document',
  icon: Package,
  feature: 'shop',
  isSingleton: true,
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
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
        })
      ],
    }
  }
};
