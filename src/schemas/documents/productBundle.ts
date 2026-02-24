import { StackIcon } from '@phosphor-icons/react'

import { PriceInput } from '../../components/PriceInput'
import { ITSDocumentDefinition, PRODUCT_TYPES } from '../../types'
import { createSharedProductFields, createSharedProductGroups } from './productAndVariantFields'

export const productBundle: ITSDocumentDefinition = {
  name: 'productBundle',
  type: 'document',
  icon: StackIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  build: (ctx) => {
    const { f } = ctx
    return {
      groups: createSharedProductGroups(ctx, PRODUCT_TYPES.BUNDLE),
      fieldsets: [],
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne', group: 'product' }),
        f('price', 'number', {
          validation: (Rule) => Rule.positive().required(),
          group: 'pricing',
          components: {
            input: PriceInput,
          },
        }),
        ...createSharedProductFields(ctx, PRODUCT_TYPES.BUNDLE),
        f('items', 'array', {
          of: [
            {
              type: 'productBundleItem',
            },
          ],
          group: 'product',
          validation: (Rule) => Rule.required(),
          // options: {
          //   layout: 'grid'
          // },
          // components: {
          //   input: GenerateVariants
          // },
        }),
        // f('n18nRequiredTitel', 'string', { validation: (Rule) => Rule.required() }),
      ],
      preview: {
        select: {
          title: 'title',
          image: 'images.0.image',
          items: 'items',
        },
        prepare({ title, image, items }) {
          const count = items?.length || 0
          return {
            title: ctx.localizer.value(title),
            subtitle: ctx.t.default('productBundle.preview.items', 'products', { count }),
            media: ctx.localizer.value(image) || StackIcon,
          }
        },
      },
    }
  },
}
