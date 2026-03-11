// import { ProductPreview } from '../../components/previews/ProductPreview'

import { ProductIcon, productKindIcons } from '../../assets/icons'
// import { GenerateVariants } from '../../components/GenerateVariants'
// import { CreateProductFromWines } from '../../components/products/CreateProductFromWines'
import { ITSDocumentDefinition, ProductKind } from '../../types'

export const product: ITSDocumentDefinition = {
  name: 'product',
  type: 'document',
  icon: ProductIcon,
  feature: 'shop',
  allowCreate: false,
  disallowedActions: ['delete', 'duplicate'],
  build: (ctx) => {
    const { f } = ctx

    const groupedData = ctx.builders.buildGroupedSchema([
      {
        name: 'infos',
        fields: [
          f('title', 'i18nString', { i18n: 'atLeastOne' }),
          f('kind', 'string', {
            options: {
              list: ctx.config.schemaSettings.productKinds.map((type) => ({ value: type })),
              layout: 'dropdown',
              // direction: 'horizontal',
            },
            hidden: !ctx.config.isDev,
            validation: (Rule) => Rule.required(),
          }),
          f('weight', 'number', {
            validation: (rule) => rule.positive().integer(),
            hidden: ({ document }) => document?.kind !== 'physical',
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
          f('taxCategory', 'reference', { to: [{ type: 'taxCategory' }], group: 'vat' }),
          ctx.builders.priceField({
            validation: (Rule) => Rule.required(),
            group: 'pricing',
          }),
          ctx.builders.priceField({
            name: 'compareAtPrice',
            validation: (Rule) => Rule.positive(),
          }),
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
          kind: 'kind',
        },
        prepare({ title, image, kind }) {
          const productKind: ProductKind = kind
          const media =
            ctx.localizer.value(image) || (kind ? productKindIcons[productKind] : ProductIcon)
          return {
            title: ctx.localizer.value(title),
            media,
          }
        },
      },
    }
  },
}
