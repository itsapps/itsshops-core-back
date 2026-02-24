// import { ProductPreview } from '../../components/previews/ProductPreview'
import { CubeIcon } from '@phosphor-icons/react'

import { GenerateVariants } from '../../components/GenerateVariants'
import { ITSDocumentDefinition, PRODUCT_TYPES } from '../../types'
import { createSharedProductFields, createSharedProductGroups } from './productAndVariantFields'

export const product: ITSDocumentDefinition = {
  name: 'product',
  type: 'document',
  icon: CubeIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  build: (ctx) => {
    const { f } = ctx
    return {
      groups: createSharedProductGroups(ctx, PRODUCT_TYPES.PRODUCT),
      fieldsets: [],
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne', group: 'product' }),
        ctx.builders.priceField({
          validation: (Rule) => Rule.required(),
          group: 'pricing',
        }),
        ...createSharedProductFields(ctx, PRODUCT_TYPES.PRODUCT),
        f('variants', 'array', {
          of: [
            {
              type: 'reference',
              to: [{ type: 'productVariant' }],
            },
          ],
          group: 'variants',
          components: {
            input: GenerateVariants,
          },
        }),
      ],
      preview: {
        select: {
          title: 'title',
          image: 'images.0.image',
          variants: 'variants',
        },
        prepare({ title, image, variants }) {
          const count = variants && variants.length > 0 ? variants.length : 0
          const variantInfo =
            count > 0 ? ctx.t.default('product.preview.variants', 'variants', { count }) : undefined
          return {
            title: ctx.localizer.value(title),
            ...(variantInfo && { subtitle: variantInfo }),
            media: ctx.localizer.value(image) || CubeIcon,
          }
        },
      },
    }
  },
}
