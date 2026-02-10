import { ITSSchemaDefinition } from '../../types';

import { PackageIcon } from '@sanity/icons'
// import { ProductMediaPreview } from '../../components/previews/ProductMediaPreview';

export const productBundleItem: ITSSchemaDefinition = {
  name: 'productBundleItem',
  type: 'object',
  feature: 'shop',
  build: (ctx) => ({
    // fields: ctx.builders.internalLink({ includeTitle: true, includeDisplayType: true })
    fields: [
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