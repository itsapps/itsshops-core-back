import { BundleItemIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'
// import { ProductMediaPreview } from '../../components/previews/ProductMediaPreview';

export const bundleItem: ITSSchemaDefinition = {
  name: 'bundleItem',
  type: 'object',
  feature: 'shop',
  icon: BundleItemIcon,
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
          filter: ({ document }: any) => {
            // 'document' here is the parent productVariant being edited
            const parentProductId = document.product?._ref

            return {
              filter: 'kind != "bundle" && product._ref != $parentProductId',
              params: {
                parentProductId: parentProductId || '',
              },
            }
          }
        },
      }),
    ],
    preview: {
      select: {
        title: 'product.title',
        productTitle: 'product.product.title',
        quantity: 'quantity',
        image: 'product.image.image',
        productImage: 'product.product.image.image',
      },
      prepare({ title, productTitle, quantity, image, productImage }) {
        return {
          // title: ctx.localizer.value(title),
          title:
            title || productTitle
              ? `${quantity}x "${ctx.localizer.value(title) || ctx.localizer.value(productTitle)}"`
              : '-',
          // subtitle: ctx.t.default('productBundleItem.preview.quantity', 'product', { count: quantity }),
          media: ctx.localizer.value(image) || ctx.localizer.value(productImage) || BundleItemIcon,
          // media: ProductMediaPreview({ info: `${quantity}x` }),
        }
      },
    },
  }),
}
