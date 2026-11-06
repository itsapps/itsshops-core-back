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
  disallowedActions: ['duplicate'],
  build: (ctx) => {
    const { f } = ctx

    const groupedData = ctx.builders.buildGroupedSchema([
      {
        name: 'infos',
        fields: [
          f('title', 'i18nString', { i18n: 'atLeastOne' }),
          f('description', 'i18nText'),
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
          f('specifications', 'array', {
            of: [{ type: 'productSpecification' }],
          }),
          ...(ctx.featureRegistry.isDocEnabled('category')
            ? [
                f('categories', 'array', {
                  validation: (rule) => rule.unique(),
                  of: [
                    {
                      type: 'reference',
                      title: ctx.t.default('category.title'),
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
          // A bundle is taxed by its items — no own category.
          f('taxCategory', 'reference', {
            to: [{ type: 'taxCategory' }],
            group: 'vat',
            hidden: ({ document }) => document?.kind === 'bundle',
          }),
          ctx.builders.priceField({
            validation: (Rule) => [
              Rule.positive(),
              // Emptying the product price leaves variants that relied on it unpriced (a variant's
              // own price check only runs when it is edited) — warn, never block.
              Rule.custom(async (value, context) => {
                if (typeof value === 'number') return true
                const id = (context.document?._id ?? '').replace(/^drafts\./, '')
                if (!id) return true
                const client = context.getClient({ apiVersion: ctx.config.apiVersion })
                const count = await client.fetch<number>(
                  `count(*[_type == "productVariant" && product._ref == $id && status == "active" && !defined(price) && !(_id in path("drafts.**"))])`,
                  { id },
                )
                return count === 0
                  ? true
                  : ctx.t.default(
                      'product.validation.variantsWithoutPrice',
                      `${count} active variants have no price of their own`,
                      { count },
                    )
              }).warning(),
            ],
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
        fields: [f('image', 'localeAltImage')],
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
      preview: {
        select: {
          title: 'title',
          image: 'image',
          kind: 'kind',
        },
        prepare({ title, image, kind }) {
          const productKind: ProductKind = kind
          const media = image || (kind ? productKindIcons[productKind] : ProductIcon)
          return {
            title: ctx.localizer.value(title),
            media,
          }
        },
      },
    }
  },
}
