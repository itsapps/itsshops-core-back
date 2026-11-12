import { BundleItemIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'
import { variantDetails } from '../../utils/variantLabel'

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

            // only active, priced (own or product price) non-bundle variants of other products —
            // the same rule as the Product Manager's BundleTab
            return {
              filter:
                'kind != "bundle" && status == "active" && (defined(price) || defined(product->price)) && product._ref != $parentProductId && !(_id in path("drafts.**"))',
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
        kind: 'product.kind',
        wineVolume: 'product.wine.volume',
        wineVintage: 'product.wine.vintage',
        optionTitle0: 'product.options.0.title',
        optionTitle1: 'product.options.1.title',
        optionTitle2: 'product.options.2.title',
      },
      prepare({
        variantTitle,
        productTitle,
        quantity,
        image,
        productImage,
        kind,
        wineVolume,
        wineVintage,
        optionTitle0,
        optionTitle1,
        optionTitle2,
      }) {
        const vTitle = ctx.localizer.value(variantTitle)
        const pTitle = ctx.localizer.value(productTitle)
        const count = quantity || 0
        const name = [pTitle, vTitle].filter(Boolean).join(' — ')
        return {
          title: name ? `${count}× ${name}` : '',
          // vintage/volume (wine) or options (physical/digital) — also when the variant has its own title
          subtitle: variantDetails(ctx, {
            kind,
            wineVolume,
            wineVintage,
            optionTitles: [optionTitle0, optionTitle1, optionTitle2],
          }),
          media: ctx.localizer.value(image) || ctx.localizer.value(productImage) || BundleItemIcon,
        }
      },
    },
  }),
}
