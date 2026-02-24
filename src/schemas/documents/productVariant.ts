import { SlidersHorizontalIcon } from '@phosphor-icons/react'

import { PriceInput } from '../../components/PriceInput'
import { ITSDocumentDefinition, PRODUCT_TYPES } from '../../types'
import { createSharedProductFields, createSharedProductGroups } from './productAndVariantFields'

export const productVariant: ITSDocumentDefinition = {
  name: 'productVariant',
  type: 'document',
  icon: SlidersHorizontalIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  allowCreate: false,
  hideInStructure: true,
  build: (ctx) => {
    const { f } = ctx
    return {
      groups: createSharedProductGroups(ctx, PRODUCT_TYPES.VARIANT),
      fields: [
        f('title', 'i18nString', { group: 'product' }),
        f('price', 'number', {
          validation: (Rule) => Rule.positive(),
          group: 'pricing',
          components: {
            input: PriceInput,
          },
        }),
        ...createSharedProductFields(ctx, PRODUCT_TYPES.VARIANT),
        f('active', 'boolean', { initialValue: true, group: 'product' }),
        f('options', 'array', {
          group: 'product',
          of: [
            {
              type: 'reference',
              to: [{ type: 'variantOption' }],
            },
          ],
          readOnly: true,
        }),
        f('featured', 'boolean', { initialValue: false, group: 'product' }),
        f('coverImage', 'string', { hidden: true, group: 'media' }),
      ],
      preview: {
        select: {
          title: 'title',
          options0: 'options.0.title',
          options1: 'options.1.title',
          options2: 'options.2.title',
          image: 'images.0.image',
        },
        prepare({ title, options0, options1, options2, image }) {
          const subtitle = [options0, options1, options2]
            .map((o) => ctx.localizer.value(o))
            .filter(Boolean)
            .join(', ')
          return {
            title: ctx.localizer.value(title),
            subtitle,
            media: ctx.localizer.value(image) || SlidersHorizontalIcon,
          }
        },
      },
    }
  },
}
