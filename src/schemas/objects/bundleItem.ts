import { BundleItemIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'
// import { ProductMediaPreview } from '../../components/previews/ProductMediaPreview';

export const bundleItem: ITSSchemaDefinition = {
  name: 'bundleItem',
  type: 'object',
  feature: 'shop.productKind.bundle',
  icon: BundleItemIcon,
  build: (ctx) => ({
    fields: [
      ctx.f('quantity', 'number', {
        initialValue: 1,
        validation: (Rule) => Rule.min(1).required(),
      }),
      ctx.f('product', 'reference', {
        to: [{ type: 'productVariant' }],
        validation: (Rule) => Rule.required(),
        options: {
          filter: ({ document }: any) => {
            // 'document' here is the item's productVariant being edited
            const parentProductId = document.product?._ref

            // filter so only non-bundle variants of other products are shown
            return {
              filter: 'kind != "bundle" && product._ref != $parentProductId',
              params: {
                parentProductId: parentProductId || '',
              },
            }
          },
        },
      }),
    ],
    preview: {
      select: {
        variantTitle: 'product.title',
        productTitle: 'product.product.title',
        quantity: 'quantity',
        image: 'product.image.image',
        productImage: 'product.product.image.image',
      },
      prepare({ variantTitle, productTitle, quantity, image, productImage }) {
        const vTitle = ctx.localizer.value(variantTitle)
        const pTitle = ctx.localizer.value(productTitle)
        const count = quantity || 0
        const title = vTitle || pTitle ? `${count}x ${vTitle || `[${pTitle}]`}` : ''
        return {
          // title: ctx.localizer.value(title),
          title,
          // subtitle: ctx.t.default('productBundleItem.preview.quantity', 'product', { count: quantity }),
          media: ctx.localizer.value(image) || ctx.localizer.value(productImage) || BundleItemIcon,
          // media: ProductMediaPreview({ info: `${quantity}x` }),
        }
      },
    },
  }),
}
