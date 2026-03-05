import { ProductVariantIcon } from '../../assets/icons'
import { VinofactWineSelector } from '../../components/products/VinofactWineSelector'
import { ITSDocumentDefinition, ProductKind } from '../../types'
import { validateRequiredArrayIfKind, validateRequiredIfKind } from '../../utils/validation'

export const productVariant: ITSDocumentDefinition = {
  name: 'productVariant',
  type: 'document',
  icon: ProductVariantIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  allowCreate: false,
  hideInStructure: true,
  build: (ctx) => {
    const { f } = ctx
    const stockEnabled = ctx.featureRegistry.isFeatureEnabled('shop.stock')
    const vinofactEnabled = ctx.featureRegistry.isFeatureEnabled('shop.vinofact')

    const groupedData = ctx.builders.buildGroupedSchema([
      {
        name: 'product',
        fields: [
          f('title', 'i18nString'),
          f('product', 'reference', {
            to: [{ type: 'product' }],
            readOnly: !ctx.config.isDev,
          }),
          f('kind', 'string', {
            options: {
              list: ctx.config.productKinds.map((type) => ({ value: type })),
            },
            hidden: !ctx.config.isDev,
          }),
          f('sku', 'string'),
          f('status', 'string', {
            options: {
              list: [
                { value: 'active' },
                { value: 'comingSoon' },
                { value: 'soldOut' },
                { value: 'archived' },
              ],
              layout: 'dropdown',
            },
            initialValue: 'active',
          }),
          f('featured', 'boolean', { initialValue: false }),
          f('options', 'array', {
            of: [
              {
                type: 'reference',
                to: [{ type: 'variantOption' }],
              },
            ],
            // readOnly: true,
            hidden: ({ parent }) => !['physical', 'digital'].includes(parent?.kind),
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
            validation: (Rule) => Rule.positive(),
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
        name: 'bundle',
        fields: [
          f('bundleItems', 'array', {
            of: [
              {
                type: 'bundleItem',
              },
            ],
            validation: validateRequiredArrayIfKind('bundle'),
            // validation: (Rule) =>
            //   Rule.custom((value: any, context) => {
            //     if (context.document?.kind === 'bundle' && (!value || value.length === 0)) {
            //       return context.i18n.t('validation:generic.required')
            //     }
            //     return true
            //   }),
            hidden: ({ parent }) => parent?.kind !== 'bundle',
          }),
        ],
      },
      {
        name: 'wine',
        fields: [
          ...(vinofactEnabled
            ? [
                ctx.f('vinofactWineId', 'string', {
                  components: { input: VinofactWineSelector },
                  hidden: ({ parent }) => parent?.kind !== 'wine',
                  validation: (Rule) => Rule.required().warning(),
                }),
              ]
            : []),
          ctx.f('volume', 'number', {
            validation: validateRequiredIfKind('wine'),
            options: {
              list: ctx.constants.volumeOptions,
            },
            hidden: ({ parent }) => parent?.kind !== 'wine',
          }),
          ctx.f('vintage', 'string', {
            hidden: ({ parent }) => parent?.kind !== 'wine',
          }),
        ],
      },
      ...(stockEnabled
        ? [
            {
              name: 'stock',
              fields: [
                f('stock', 'number', {
                  initialValue: 0,
                  validation: (Rule) => Rule.positive(),
                  group: 'stock',
                }),
                f('stockThreshold', 'number', {
                  validation: (Rule) => Rule.min(0),
                  group: 'stock',
                }),
              ],
            },
          ]
        : []),
    ])

    return {
      ...groupedData,
      preview: {
        select: {
          variantTitle: 'title',
          productTitle: 'product.title',
          options0: 'options.0.title',
          options1: 'options.1.title',
          options2: 'options.2.title',
          image: 'image.image',
          productImage: 'product.image.image',
          kind: 'kind',
          volume: 'volume',
          vintage: 'vintage',
        },
        prepare({
          variantTitle,
          productTitle,
          options0,
          options1,
          options2,
          image,
          productImage,
          kind,
          volume,
          vintage,
        }) {
          const vTitle = ctx.localizer.value(variantTitle)
          const pTitle = ctx.localizer.value(productTitle)
          const title = vTitle || (pTitle ? `[${pTitle}]` : '')
          let subtitle
          switch (kind as ProductKind) {
            case 'physical': {
              subtitle = [options0, options1, options2]
                .map((o) => ctx.localizer.value(o))
                .filter(Boolean)
                .join(' • ')
              break
            }
            case 'digital': {
              subtitle = [options0, options1, options2]
                .map((o) => ctx.localizer.value(o))
                .filter(Boolean)
                .join(' • ')
              break
            }
            case 'bundle': {
              subtitle = [options0, options1, options2]
                .map((o) => ctx.localizer.value(o))
                .filter(Boolean)
                .join(' • ')
              break
            }
            case 'wine': {
              const liter = ctx.format.number(volume / 1000, { style: 'unit', unit: 'liter' })
              subtitle = [liter, vintage].filter(Boolean).join(' • ')
              break
            }
            default: {
              subtitle = 'ddd'
            }
          }

          return {
            title,
            subtitle,
            media:
              ctx.localizer.value(image) || ctx.localizer.value(productImage) || ProductVariantIcon,
          }
        },
      },
    }
  },
}
