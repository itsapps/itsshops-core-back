import { ITSSchemaDefinition } from '../../../types';

import { PackageIcon } from '@sanity/icons'

export const fulfillment: ITSSchemaDefinition = {
  name: 'fulfillment',
  type: 'object',
  feature: 'shop',
  icon: PackageIcon,
  build: (ctx) => {
    const { f } = ctx;

    // const groups = ['info'].map((name, index) => ({
    //   name, ...index === 0 && { default: true }
    // }));

    const all = [
      f('methodTitle', 'i18nString', {
        description: 'Snapshotted title (e.g., "DHL Express" or "Self-Pickup")'
      }),
      f('methodType', 'string', {
        options: { list: [{value: 'delivery'}, {value: 'pickup'}] },
        validation: (Rule) => Rule.required()
      }),

      // 2. Financials: What was the cost and tax for this specific service?
      f('shippingCost', 'number', {
        description: 'The fee charged to the customer'
      }),
      
      // This handles the tax on the shipping fee itself
      f('taxSnapshot', 'vatBreakdownItem'),

      // 3. Tracking & References
      f('method', 'reference', { 
        to: [{ type: 'shippingMethod' }],
        weak: true,
        description: 'Link to the original config (may change over time)'
      }),

      f('trackingCode', 'string', {
        hidden: ({ parent }) => parent?.methodType === 'pickup'
      }),

      // 4. Pickup Specifics
      f('pickupLocation', 'string', {
        description: 'The address where the customer will collect the goods',
        hidden: ({ parent }) => parent?.methodType !== 'pickup'
      })
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