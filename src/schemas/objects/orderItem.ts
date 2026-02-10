import { ITSSchemaDefinition, ProductType } from '../../types';

import { PackageIcon } from '@sanity/icons'

export const orderItem: ITSSchemaDefinition = {
  name: 'orderItem',
  type: 'object',
  build: (ctx) => ({
    // fields: ctx.builders.internalLink({ includeTitle: true, includeDisplayType: true })
    fields: [
      ctx.f('type', 'string', {
        options: {
          list: [
            { title: ctx.t.default('orderItem.type.options.product'), value: ProductType.Product },
            { title: ctx.t.default('orderItem.type.options.productVariant'), value: ProductType.Variant },
            { title: ctx.t.default('orderItem.type.options.productBundle'), value: ProductType.Bundle },
          ],
        },
        validation: (Rule) => Rule.required(),
      }),


      ctx.f('quantity', 'number', {
        initialValue: 1,
        validation: (Rule) => Rule.min(1).required(),
      }),
      ctx.f('product', 'reference', {
        to: [
          { type: 'product' },
          { type: 'productVariant' },
        ],
        validation: (Rule) => Rule.required(),
        options: {
            // filter: options.to?.includes('product') ? `...your product filter...` : ''
            filter: `
              (active == true && _type == "productVariant") ||
              ((!defined(variants) || count(variants) == 0) && _type == "product")
            `
          }
      }),
    ],
    preview: {
      select: {
        title: 'product.title',
        quantity: 'quantity',
        image: 'product.images.0.image',
      },
      prepare({ title, quantity, image }) {
        return {
          // title: ctx.localizer.value(title),
          title: title ? `${quantity}x "${ctx.localizer.value(title)}"` : '-',
          // subtitle: ctx.t.default('productBundleItem.preview.quantity', 'product', { count: quantity }),
          media: ctx.localizer.value<any>(image) || PackageIcon,
          // media: ProductMediaPreview({ info: `${quantity}x` }),
        }
      }
    },
  })
};

// export default ((t, language) => {
//   return {
//     name: 'orderItem',
//     type: 'object',
//     fields: [
//       {
//         name: 'type',
//         type: 'number',
//         validation: (rule) => rule.required(),
//       },
//       {
//         name: 'productId',
//         type: 'string',
//         validation: (rule) => rule.required(),
//       },
//       {
//         name: 'parentId',
//         type: 'string',
//       },
//       {
//         name: 'quantity',
//         type: 'number',
//         validation: (rule) => rule.required(),
//       },
//       {
//         name: 'price',
//         type: 'number',
//         validation: (rule) => rule.required(),
//       },
//       {
//         name: 'vatRate',
//         type: 'number',
//       },
//       {
//         name: 'title',
//         type: 'localeString',
//       },
//       {
//         name: 'productNumber',
//         type: 'string',
//       },
//       {
//         name: 'options',
//         type: 'array',
//         of: [
//           {
//             type: 'object',
//             fields: [
//               {
//                 name: 'title',
//                 type: 'localeString',
//               },
//               {
//                 name: 'group',
//                 type: 'localeString',
//               }
//             ],
//           }
//         ]
//       },
//       {
//         name: 'packed',
//         type: 'boolean',
//         initialValue: false,
//       },
//     ]
//   }
// }) as LocalizedSchemaBuilder