import { FieldDefinition } from 'sanity'
import { FilterIcon } from '../../assets/icons'
import { FieldContext, ITSSchemaDefinition, TranslatorParams } from '../../types'

/** The criteria of one selector side, as stored (references as `_ref`s). */
export interface ProductSelectorCriteria {
  kinds?: string[]
  categories?: { _ref: string }[]
  manufacturers?: { _ref: string }[]
  products?: { _ref: string }[]
  variants?: { _ref: string }[]
  hasCompareAtPrice?: boolean
}

export interface ProductSelectorValue {
  include?: ProductSelectorCriteria
  exclude?: ProductSelectorCriteria
}

/**
 * The criteria fields of one side (`include` / `exclude`). Each criterion only when its feature is
 * on. All references are weak: a discount must never block deleting an old vintage, a category or
 * a manufacturer — core-front only compares ids, so a dangling one simply never matches.
 */
const criteriaFields = (ctx: FieldContext): FieldDefinition[] => {
  const { f } = ctx
  const isOn = ctx.featureRegistry.isFeatureEnabled
  const weakRef = (type: string, filter?: string) => ({
    type: 'reference' as const,
    to: [{ type }],
    weak: true,
    options: { disableNew: true, ...(filter && { filter }) },
  })
  const refArray = (name: string, type: string, filter?: string) =>
    f(name, 'array', {
      of: [weakRef(type, filter)],
      validation: (rule) => rule.unique(),
      options: { sortable: false },
    })

  return [
    f('kinds', 'array', {
      of: [{ type: 'string' }],
      options: {
        list: ctx.config.schemaSettings.productKinds
          .filter((kind) => isOn(`shop.productKind.${kind}` as const))
          .map((kind) => ({ value: kind })),
      },
    }),
    ...(isOn('shop.category') ? [refArray('categories', 'category')] : []),
    ...(isOn('shop.manufacturer') ? [refArray('manufacturers', 'manufacturer')] : []),
    refArray('products', 'product'),
    refArray('variants', 'productVariant', 'status != "archived"'),
    f('hasCompareAtPrice', 'boolean'),
  ]
}

/** Short summary of one side, e.g. "Typ: Paket · 2 Kategorien". */
export const describeCriteria = (
  ctx: Pick<FieldContext, 't'>,
  criteria: ProductSelectorCriteria | undefined,
): string => {
  if (!criteria) return ''
  const t = (key: string, fallback: string, params?: TranslatorParams) =>
    ctx.t.default(`productSelectorCriteria.preview.${key}`, fallback, params)
  const parts: string[] = []
  if (criteria.kinds?.length) {
    const kinds = criteria.kinds
      .map((kind) => ctx.t.default(`productSelectorCriteria.fields.kinds.options.${kind}`, kind))
      .join(', ')
    parts.push(`${t('kinds', 'Kind')}: ${kinds}`)
  }
  const counted: [keyof ProductSelectorCriteria, string][] = [
    ['categories', 'Categories'],
    ['manufacturers', 'Manufacturers'],
    ['products', 'Products'],
    ['variants', 'Variants'],
  ]
  for (const [key, fallback] of counted) {
    const list = criteria[key] as unknown[] | undefined
    if (list?.length) parts.push(t(key, `${list.length} ${fallback}`, { count: list.length }))
  }
  if (criteria.hasCompareAtPrice) parts.push(t('hasCompareAtPrice', 'with compare-at price'))
  return parts.join(' · ')
}

/** Summary of a whole selector, e.g. "Typ: Paket · ohne 1 Kategorie". Empty = every product. */
export const describeSelector = (
  ctx: Pick<FieldContext, 't'>,
  selector: ProductSelectorValue | undefined,
): string => {
  const include = describeCriteria(ctx, selector?.include)
  const exclude = describeCriteria(ctx, selector?.exclude)
  return [
    include || ctx.t.default('productSelector.preview.all', 'All products'),
    exclude && `${ctx.t.default('productSelector.preview.without', 'without')} ${exclude}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** One selector side. Its own type so typegen names it (`ProductSelectorCriteria`). */
export const productSelectorCriteria: ITSSchemaDefinition = {
  name: 'productSelectorCriteria',
  type: 'object',
  icon: FilterIcon,
  feature: 'shop.discounts',
  build: (ctx) => ({
    fields: criteriaFields(ctx),
    preview: {
      select: {
        kinds: 'kinds',
        categories: 'categories',
        manufacturers: 'manufacturers',
        products: 'products',
        variants: 'variants',
        hasCompareAtPrice: 'hasCompareAtPrice',
      },
      prepare: (value) => ({
        title: describeCriteria(ctx, value as ProductSelectorCriteria),
        media: FilterIcon,
      }),
    },
  }),
}

/**
 * Which products something applies to (discount `appliesTo`, `shopSettings.discountExclusions`).
 * A line matches when `include` is empty or any include criterion matches, and no exclude
 * criterion matches. Evaluated by core-front `src/shared/discounts/selector.ts`.
 */
export const productSelector: ITSSchemaDefinition = {
  name: 'productSelector',
  type: 'object',
  icon: FilterIcon,
  feature: 'shop.discounts',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('include', 'productSelectorCriteria', {
          options: { collapsible: true, collapsed: false },
        }),
        // The shop-wide exclusions are an include list only ("never discount").
        f('exclude', 'productSelectorCriteria', {
          options: { collapsible: true, collapsed: true },
          hidden: ({ document }) => document?._type === 'shopSettings',
        }),
      ],
      preview: {
        select: { include: 'include', exclude: 'exclude' },
        prepare: (value) => ({
          title: describeSelector(ctx, value as ProductSelectorValue),
          media: FilterIcon,
        }),
      },
    }
  },
}
