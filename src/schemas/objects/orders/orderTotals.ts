import { ITSSchemaDefinition, ProductType } from '../../../types';

import { PackageIcon } from '@sanity/icons'
import { FieldDefinition, isDev } from 'sanity'

export const orderTotals: ITSSchemaDefinition = {
  name: 'orderTotals',
  type: 'object',
  feature: 'shop',
  icon: PackageIcon,
  build: (ctx) => {
    const { f } = ctx;

    // const groups = ['info'].map((name, index) => ({
    //   name, ...index === 0 && { default: true }
    // }));

    const all = [
      f('grandTotal', 'number', {
        validation: (Rule) => Rule.positive().required(),
      }),
      f('subtotal', 'number', {
        validation: (Rule) => Rule.positive().required(),
      }),
      f('shipping', 'number', {
        validation: (Rule) => Rule.positive().required(),
      }),
      f('discount', 'number', {
        validation: (Rule) => Rule.positive().required(),
      }),
      f('totalVat', 'number', {
        validation: (Rule) => Rule.positive().required(),
      }),
      // f('packed', 'boolean', {
      //   // validation: (Rule) => Rule.min(1).required(),
      // }),
      
      // f('currency', 'string', {}),

      // {
      //   name: 'vatBreakdown',
      //   type: 'array',
      //   of: [{
      //     type: 'object',
      //     fields: [
      //       { name: 'rate', type: 'number' },
      //       { name: 'net', type: 'number' },
      //       { name: 'vat', type: 'number' }
      //     ]
      //   }]
      // }

    ]
    
    // const fieldsMap: Record<string, FieldDefinition[]> = {
      
    // }
    // const fields = groups.map(({ name }) => ([
    //   ...fieldsMap[name].map(field => ({ ...field, group: name }))
    // ])).flat();

    return {
      // groups,
      fields: all,
      // preview: {
      //   select: {
      //     title: 'product.title',
      //     quantity: 'quantity',
      //     image: 'product.images.0.image',
      //   },
      //   prepare({ title, quantity, image }) {
      //     return {
      //       // title: ctx.localizer.value(title),
      //       title: title ? `${quantity}x "${ctx.localizer.value(title)}"` : '-',
      //       // subtitle: ctx.t.default('productBundleItem.preview.quantity', 'product', { count: quantity }),
      //       media: ctx.localizer.value<any>(image) || PackageIcon,
      //       // media: ProductMediaPreview({ info: `${quantity}x` }),
      //     }
      //   }
      // },
    }
  }
}