import { PackageIcon } from '@sanity/icons'

import { ITSSchemaDefinition } from '../../types'
// import { ProductMediaPreview } from '../../components/previews/ProductMediaPreview';

export const bundleItem: ITSSchemaDefinition = {
  name: 'bundleItem',
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
        to: [{ type: 'productVariant' }],
        validation: (Rule) => Rule.required(),
        options: {
          // filter: options.to?.includes('product') ? `...your product filter...` : ''
          filter: `
            (active == true)
          `,
        },
      }),
    ],
    preview: {
      select: {
        title: 'product.title',
        quantity: 'quantity',
        image: 'product.image',
      },
      prepare({ title, quantity, image }) {
        return {
          // title: ctx.localizer.value(title),
          title: title ? `${quantity}x "${ctx.localizer.value(title)}"` : '-',
          // subtitle: ctx.t.default('productBundleItem.preview.quantity', 'product', { count: quantity }),
          media: ctx.localizer.value<any>(image) || PackageIcon,
          // media: ProductMediaPreview({ info: `${quantity}x` }),
        }
      },
    },
  }),
}