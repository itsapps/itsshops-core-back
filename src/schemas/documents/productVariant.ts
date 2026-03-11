import { FieldDefinition } from 'sanity'

import { ProductVariantIcon } from '../../assets/icons'
import { WineSelector } from '../../components/products/WineSelector'
import {
  FieldContext,
  InternationalizedArrayString,
  ITSDocumentDefinition,
  ProductKind,
  ProductVariant,
  VariantOptionReference,
} from '../../types'
import { validateRequiredArrayIfKind } from '../../utils/validation'

export const productVariant: ITSDocumentDefinition = {
  name: 'productVariant',
  type: 'document',
  icon: ProductVariantIcon,
  feature: 'shop',
  allowCreate: false,
  disallowedActions: ['delete', 'duplicate'],
  hideInStructure: true,
  build: (ctx) => {
    const { f } = ctx
    const stockEnabled = ctx.featureRegistry.isFeatureEnabled('shop.stock')
    const kindFields = getKindFields(ctx)

    const groupedData = ctx.builders.buildGroupedSchema([
      {
        name: 'variant',
        fields: [
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

          ...kindFields,

          ...(ctx.featureRegistry.isDocEnabled('category')
            ? [
                f('categories', 'array', {
                  validation: (rule) => rule.unique(),
                  of: [{ type: 'reference', to: [{ type: 'category' }] }],
                  options: {
                    disableActions: ['duplicate', 'addBefore', 'addAfter', 'copy'],
                    sortable: false,
                  },
                }),
              ]
            : []),

          f('kind', 'string', {
            options: {
              list: ctx.config.schemaSettings.productKinds.map((type) => ({ value: type })),
            },
            hidden: !ctx.config.isDev,
            validation: (rule) => rule.required(),
          }),

          f('featured', 'boolean', { initialValue: false }),
          ...(ctx.featureRegistry.isDocEnabled('manufacturer')
            ? [
                f('manufacturers', 'array', {
                  validation: (rule) => rule.unique(),
                  of: [{ type: 'reference', to: [{ type: 'manufacturer' }] }],
                }),
              ]
            : []),
        ],
      },
      {
        name: 'infos',
        fields: [
          f('title', 'i18nString'),
          f('product', 'reference', {
            to: [{ type: 'product' }],
            readOnly: !ctx.config.isDev,
            validation: (rule) => rule.required(),
          }),

          f('sku', 'string'),
        ],
      },
      {
        name: 'pricing',
        fields: [
          f('taxCategory', 'reference', { to: [{ type: 'taxCategory' }], group: 'vat' }),
          ctx.builders.priceField({
            validation: (Rule) => Rule.positive(),
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

    const wineEnabled = ctx.featureRegistry.isFeatureEnabled('shop.productKind.wine')
    const physicalEnabled = ctx.featureRegistry.isFeatureEnabled('shop.productKind.physical')
    const digitalEnabled = ctx.featureRegistry.isFeatureEnabled('shop.productKind.digital')
    const bundleEnabled = ctx.featureRegistry.isFeatureEnabled('shop.productKind.bundle')
    const optionsEnabled = ctx.featureRegistry.isFeatureEnabled('shop.productKind.options')
    const optionsActuallyEnabled = optionsEnabled && (physicalEnabled || digitalEnabled)

    const previewSelect = {
      variantTitle: 'title',
      productTitle: 'product.title',
      image: 'image.image',
      productImage: 'product.image.image',
      kind: 'kind',
      // physical + digital: option ref titles
      ...(optionsActuallyEnabled && {
        options: 'options',
        optionTitle0: 'options.0.title',
        optionTitle1: 'options.1.title',
        optionTitle2: 'options.2.title',
      }),
      // wine: volume + vintage
      ...(wineEnabled && {
        wineVolume: 'wine.volume',
        wineVintage: 'wine.vintage',
      }),
      // bundle: bundle item product titles
      ...(bundleEnabled && {
        bundleItems: 'bundleItems',
      }),
    }

    return {
      ...groupedData,
      preview: {
        select: previewSelect,
        prepare({
          variantTitle,
          productTitle,
          options,
          optionTitle0,
          optionTitle1,
          optionTitle2,
          image,
          productImage,
          kind,
          wineVolume,
          wineVintage,
          bundleItems,
        }) {
          const vTitle = ctx.localizer.value(variantTitle)
          const pTitle = ctx.localizer.value(productTitle)
          const title = vTitle ?? (pTitle ? `[${pTitle}]` : '')

          const subtitle = buildSubtitle(ctx, kind, {
            options: {
              all: options,
              titles: [optionTitle0, optionTitle1, optionTitle2],
            },
            wineVolume,
            wineVintage,
            bundleItemCount: bundleItems?.length ?? 0,
          })
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

// ─── Preview subtitle ─────────────────────────────────────────────────────────

function buildSubtitle(
  ctx: FieldContext,
  kind: ProductKind,
  data: {
    options: {
      all: VariantOptionReference[] | null
      titles: (InternationalizedArrayString | null)[]
    }
    wineVolume?: number
    wineVintage?: string
    bundleItemCount: number
  },
): string {
  switch (kind) {
    case 'wine': {
      const liter =
        data.wineVolume && Number.isInteger(data.wineVolume)
          ? ctx.format.number(data.wineVolume / 1000, { style: 'unit', unit: 'liter' })
          : data.wineVolume
      return [liter, data.wineVintage].filter(Boolean).join(' • ')
    }
    case 'physical':
    case 'digital':
      return data.options.titles
        .map((o) => ctx.localizer.value(o))
        .filter(Boolean)
        .join(' • ')
    case 'bundle':
      return ctx.schemaT.default(
        'productVariant.preview.bundleItems',
        `${data.bundleItemCount} Products`,
        {
          count: data.bundleItemCount,
        },
      )
    default:
      return ''
  }
}

// ─── Kind field builders ──────────────────────────────────────────────────────

function getWineFields(ctx: FieldContext): FieldDefinition[] {
  return [
    ctx.f('wine', 'wine', {
      hidden: ({ parent }: { parent: ProductVariant }) => parent?.kind !== 'wine',
      components: { input: WineSelector },
      validation: (Rule) =>
        Rule.custom((_, context) => {
          const doc = context.document as ProductVariant
          if (doc?.kind !== 'wine') return true
          if (!doc?.wine?.vinofactWineId || !doc?.wine?.volume) {
            return context.i18n.t('validation:generic.required')
          }
          return true
        }),
    }),
  ]
}

function getOptionsFields(ctx: FieldContext): FieldDefinition[] {
  return [
    ctx.f('options', 'array', {
      of: [{ type: 'reference', to: [{ type: 'variantOption' }] }],
      hidden: ({ parent }: { parent: ProductVariant }) =>
        !parent?.kind || !['physical', 'digital'].includes(parent.kind),
    }),
  ]
}

function getPhysicalFields(ctx: FieldContext): FieldDefinition[] {
  return [
    ctx.f('weight', 'number', {
      validation: (rule) => rule.positive().integer(),
      hidden: ({ parent }) => parent?.kind !== 'physical',
    }),
  ]
}

function getBundleFields(ctx: FieldContext): FieldDefinition[] {
  return [
    ctx.f('bundleItems', 'array', {
      of: [{ type: 'bundleItem' }],
      validation: validateRequiredArrayIfKind('bundle'),
      hidden: ({ parent }: { parent: ProductVariant }) => parent?.kind !== 'bundle',
    }),
  ]
}

function getKindFields(ctx: FieldContext): FieldDefinition[] {
  const kindFieldBuilders: Record<ProductKind, () => FieldDefinition[]> = {
    wine: () => getWineFields(ctx),
    physical: () => getPhysicalFields(ctx),
    digital: () => [],
    bundle: () => getBundleFields(ctx),
  }

  const optionsEnabled =
    ctx.featureRegistry.isFeatureEnabled('shop.productKind.options') &&
    (ctx.featureRegistry.isFeatureEnabled('shop.productKind.physical') ||
      ctx.featureRegistry.isFeatureEnabled('shop.productKind.digital'))

  const kindFields = (Object.entries(kindFieldBuilders) as [ProductKind, () => FieldDefinition[]][])
    .filter(([kind]) => ctx.featureRegistry.isFeatureEnabled(`shop.productKind.${kind}`))
    .flatMap(([_, builder]) => builder())

  return [...(optionsEnabled ? getOptionsFields(ctx) : []), ...kindFields]
}
