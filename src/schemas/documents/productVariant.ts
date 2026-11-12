import { FieldDefinition, NumberRule, Rule as SanityRule } from 'sanity'

import { productKindIcons, ProductVariantIcon } from '../../assets/icons'
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
import { variantDetails } from '../../utils/variantLabel'

export const productVariant: ITSDocumentDefinition = {
  name: 'productVariant',
  type: 'document',
  icon: ProductVariantIcon,
  feature: 'shop',
  allowCreate: false,
  disallowedActions: ['duplicate'],
  hideInStructure: true,
  build: (ctx) => {
    const { f, t } = ctx
    const stockEnabled = ctx.featureRegistry.isFeatureEnabled('shop.stock')
    const bundlesOn = ctx.featureRegistry.isFeatureEnabled('shop.productKind.bundle')
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
            // A variant leaving `active` while active bundles contain it: warn (never block —
            // checkout refuses those bundles, the page shows them sold out).
            ...(bundlesOn && {
              validation: (rule: SanityRule) => usedInActiveBundlesWarning(ctx, rule),
            }),
          }),

          ...kindFields,

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

          f('kind', 'string', {
            options: {
              list: ctx.config.schemaSettings.productKinds.map((type) => ({ value: type })),
            },
            hidden: !ctx.config.isDev,
            validation: (rule) => rule.required(),
          }),

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
          f('description', 'i18nText'),
          f('product', 'reference', {
            to: [{ type: 'product' }],
            readOnly: !ctx.config.isDev,
            validation: (rule) => rule.required(),
          }),

          f('sku', 'string'),
          f('specifications', 'array', {
            of: [{ type: 'productSpecification' }],
          }),
        ],
      },
      {
        name: 'pricing',
        fields: [
          // A bundle is taxed by its items (checkout splits its price over them) — no own category.
          f('taxCategory', 'reference', {
            to: [{ type: 'taxCategory' }],
            group: 'vat',
            hidden: ({ document }) => document?.kind === 'bundle',
          }),
          ctx.builders.priceField({
            validation: (Rule) => [Rule.positive(), activeNeedsPrice(ctx, Rule)],
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
      image: 'image',
      productImage: 'product.image',
      kind: 'kind',
      status: 'status',
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
      orderings: [
        {
          title: `${t.default('productVariant.fields.vintage.title')} (${t.default('orderings.desc')})`,
          name: 'vintageDesc',
          by: [{ field: 'wine.vintage', direction: 'desc' }],
        },
        {
          title: `${t.default('productVariant.fields.vintage.title')} (${t.default('orderings.asc')})`,
          name: 'vintageAsc',
          by: [{ field: 'wine.vintage', direction: 'asc' }],
        },
        {
          title: `${t.default('productVariant.fields.volume.title')} (${t.default('orderings.desc')})`,
          name: 'volumeDesc',
          by: [{ field: 'wine.volume', direction: 'desc' }],
        },
        {
          title: `${t.default('productVariant.fields.volume.title')} (${t.default('orderings.asc')})`,
          name: 'volumeAsc',
          by: [{ field: 'wine.volume', direction: 'asc' }],
        },
      ],
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
          status,
          wineVolume,
          wineVintage,
          bundleItems,
        }) {
          const vTitle = ctx.localizer.value(variantTitle)
          const pTitle = ctx.localizer.value(productTitle)
          const title = vTitle ?? (pTitle ? `[${pTitle}]` : '')

          const kindSubtitle = buildSubtitle(ctx, kind, {
            options: {
              all: options,
              titles: [optionTitle0, optionTitle1, optionTitle2],
            },
            wineVolume,
            wineVintage,
            bundleItemCount: bundleItems?.length ?? 0,
          })

          const statusIcons: Record<string, string> = {
            comingSoon: '🟡',
            soldOut: '🔴',
            archived: '⚪',
          }
          const statusIcon = statusIcons[status] ?? ''
          // With an own title the product name isn't in the title — put it in front of the details,
          // so reference pickers / search tell "Reserve" of one wine from another's.
          const productHint = vTitle && pTitle ? pTitle : ''
          const details = [productHint, kindSubtitle].filter(Boolean).join(' · ')
          const subtitle = [statusIcon, details].filter(Boolean).join(' ')

          return {
            title,
            subtitle,
            media:
              ctx.localizer.value(image) ||
              ctx.localizer.value(productImage) ||
              (kind ? productKindIcons[kind as ProductKind] : ProductVariantIcon),
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
    case 'wine':
    case 'physical':
    case 'digital':
      return variantDetails(ctx, {
        kind,
        wineVolume: data.wineVolume,
        wineVintage: data.wineVintage,
        optionTitles: data.options.titles,
      })
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

// ─── Validation ───────────────────────────────────────────────────────────────

const publishedId = (id: string | undefined) => (id ?? '').replace(/^drafts\./, '')

/**
 * Price (error): an `active` variant needs a price — its own or its product's. Other statuses
 * publish without one; drafts can always be saved.
 */
function activeNeedsPrice(ctx: FieldContext, rule: NumberRule): NumberRule {
  return rule.custom(async (value, context) => {
    const doc = context.document as ProductVariant | undefined
    if (!doc || (doc.status ?? 'active') !== 'active') return true
    if (typeof value === 'number') return true
    const productId = publishedId(doc.product?._ref)
    if (!productId) return true
    const client = context.getClient({ apiVersion: ctx.config.apiVersion })
    const productPrice = await client.fetch<number | null>(`*[_id == $id][0].price`, {
      id: productId,
    })
    return typeof productPrice === 'number'
      ? true
      : ctx.t.default(
          'productVariant.validation.priceRequired',
          "An active variant needs a price — its own or the product's",
        )
  })
}

/** Status (warning): name the active bundles that contain this variant when it leaves `active`. */
function usedInActiveBundlesWarning(ctx: FieldContext, rule: SanityRule): SanityRule {
  return rule
    .custom(async (value, context) => {
      if ((value ?? 'active') === 'active') return true
      const id = publishedId(context.document?._id)
      if (!id) return true
      const client = context.getClient({ apiVersion: ctx.config.apiVersion })
      const bundles = await client.fetch<
        {
          title: InternationalizedArrayString | null
          productTitle: InternationalizedArrayString | null
        }[]
      >(
        `*[_type == "productVariant" && kind == "bundle" && status == "active" && references($id) && !(_id in path("drafts.**"))]{title, "productTitle": product->title}`,
        { id },
      )
      if (bundles.length === 0) return true
      const names = bundles.map(
        (b) => ctx.localizer.value(b.title) || ctx.localizer.value(b.productTitle) || '?',
      )
      return ctx.t.default(
        'productVariant.validation.usedInActiveBundles',
        `Used in ${bundles.length} active bundles: ${names.join(', ')}`,
        {
          count: bundles.length,
          names: names.join(', '),
        },
      )
    })
    .warning()
}

type BundleItemValue = { _key?: string; product?: { _ref?: string } }
type ItemCheck = {
  _id: string
  status: string | null
  price: number | null
  productPrice: number | null
  title: InternationalizedArrayString | null
  productTitle: InternationalizedArrayString | null
}

/**
 * Bundle items (error):
 * - every status: the same variant listed twice (raise its quantity instead);
 * - only while the bundle is `active`: an item that is missing, not `active`, or has no price
 *   (own or its product's — checkout splits the bundle's VAT by the items' prices).
 * Only an error while active, so setting the bundle to `soldOut`/`archived` stays publishable.
 */
function validateBundleItems(ctx: FieldContext, rule: SanityRule): SanityRule {
  return rule.custom(async (value, context) => {
    const doc = context.document as ProductVariant | undefined
    if (doc?.kind !== 'bundle' || !Array.isArray(value) || value.length === 0) return true
    const refs = (value as BundleItemValue[])
      .map((v) => publishedId(v?.product?._ref))
      .filter(Boolean)
    const isActive = (doc.status ?? 'active') === 'active'
    const duplicates = [...new Set(refs.filter((id, i) => refs.indexOf(id) !== i))]
    if (duplicates.length === 0 && !isActive) return true

    const client = context.getClient({ apiVersion: ctx.config.apiVersion })
    const found = await client.fetch<ItemCheck[]>(
      `*[_id in $ids]{_id, status, price, "productPrice": product->price, title, "productTitle": product->title}`,
      { ids: [...new Set(refs)] },
    )
    const byId = new Map(found.map((v) => [v._id, v]))
    const name = (id: string) => {
      const v = byId.get(id)
      return (v && (ctx.localizer.value(v.title) || ctx.localizer.value(v.productTitle))) || id
    }

    if (duplicates.length) {
      return ctx.t.default(
        'productVariant.validation.duplicateItem',
        `Listed more than once: ${duplicates.map(name).join(', ')} — raise its quantity instead`,
        { names: duplicates.map(name).join(', ') },
      )
    }
    const ids = [...new Set(refs)]
    const inactive = ids.filter((id) => !byId.has(id) || byId.get(id)!.status !== 'active')
    if (inactive.length) {
      return ctx.t.default(
        'productVariant.validation.inactiveItem',
        `This bundle is active, but these items aren't: ${inactive.map(name).join(', ')}`,
        { names: inactive.map(name).join(', ') },
      )
    }
    const unpriced = ids.filter((id) => {
      const v = byId.get(id)!
      return typeof v.price !== 'number' && typeof v.productPrice !== 'number'
    })
    if (unpriced.length) {
      return ctx.t.default(
        'productVariant.validation.unpricedItem',
        `These items have no price (needed to split the VAT): ${unpriced.map(name).join(', ')}`,
        { names: unpriced.map(name).join(', ') },
      )
    }
    return true
  })
}

function getBundleFields(ctx: FieldContext): FieldDefinition[] {
  return [
    ctx.f('bundleItems', 'array', {
      of: [{ type: 'bundleItem' }],
      validation: (rule) => [
        validateRequiredArrayIfKind('bundle')(rule),
        validateBundleItems(ctx, rule),
      ],
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
