// import { ProductPreview } from '../../components/previews/ProductPreview'
import { CubeIcon } from '@phosphor-icons/react'

// import { GenerateVariants } from '../../components/GenerateVariants'
// import { CreateProductFromWines } from '../../components/products/CreateProductFromWines'
import { ITSDocumentDefinition } from '../../types'

export const product: ITSDocumentDefinition = {
  name: 'product',
  type: 'document',
  icon: CubeIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  build: (ctx) => {
    const { f } = ctx

    const groupedData = ctx.builders.buildGroupedSchema([
      {
        name: 'product',
        fields: [
          f('title', 'i18nString', { i18n: 'atLeastOne' }),
          f('kind', 'string', {
            options: {
              list: ctx.config.productKinds.map((type) => ({ value: type })),
              layout: 'dropdown',
              // direction: 'horizontal',
            },
          }),
          ...(ctx.featureRegistry.isDocEnabled('category')
            ? [
                f('categories', 'array', {
                  validation: (rule) => rule.unique(),
                  of: [
                    {
                      type: 'reference',
                      to: [{ type: 'category' }],
                    },
                  ],
                  options: {
                    disableActions: ['duplicate', 'addBefore', 'addAfter', 'copy'],
                    sortable: false,
                  },
                }),
              ]
            : []),
          ...(ctx.featureRegistry.isDocEnabled('manufacturer')
            ? [
                f('manufacturers', 'array', {
                  validation: (rule) => rule.unique(),
                  of: [
                    {
                      type: 'reference',
                      to: [{ type: 'manufacturer' }],
                    },
                  ],
                }),
              ]
            : []),
        ],
      },
      {
        name: 'pricing',
        fields: [
          ctx.builders.priceField({
            validation: (Rule) => Rule.required(),
            group: 'pricing',
          }),
          ctx.builders.priceField({
            name: 'compareAtPrice',
            validation: (Rule) => Rule.positive(),
          }),
          f('taxCategory', 'reference', { to: [{ type: 'taxCategory' }], group: 'vat' }),
        ],
      },
      {
        name: 'media',
        fields: [f('image', 'localeImage')],
      },
      {
        name: 'seo',
        fields: [f('seo', 'seo')],
      },
      {
        name: 'variants',
        fields: [],
      },
    ])

    return {
      ...groupedData,
      fieldsets: [],
      preview: {
        select: {
          title: 'title',
          image: 'image.image',
        },
        prepare({ title, image }) {
          return {
            title: ctx.localizer.value(title),
            media: ctx.localizer.value(image) || CubeIcon,
          }
        },
      },
    }
  },
}
