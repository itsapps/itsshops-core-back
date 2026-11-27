/**
 * Variant ⇄ product inheritance: when a variant field counts as "set" (an empty one uses the
 * product's value) and how an inherited value reads in a hint. Same rules as core-front's
 * resolver (`data-layer.md` → "Variant → product fallbacks"), so the Studio can't disagree with
 * the shop:
 * number → `typeof === 'number'` (0 is set); array → `length > 0`; i18n → an entry with a
 * non-blank `value`; image → `asset._ref`; reference → `_ref`.
 * Pure — used by `InheritedField` (variant form), `OverriddenByVariants` (product form) and the
 * Product Manager's placeholders.
 */
import type { ITSFormatter, ITSLocalizer, TranslatorFunction } from '../types/localization'

export type InheritKind = 'number' | 'array' | 'i18n' | 'image' | 'reference'

/** How a value is written in a hint. */
export type InheritFormat =
  'currency' | 'weight' | 'tax' | 'titles' | 'specifications' | 'text' | 'image'

/** `options.inherit` of a field wrapped by `builders.inherited` / `builders.inheritedBy`. */
export interface InheritSpec {
  kind: InheritKind
  format: InheritFormat
  /** Product field it inherits from; default: the field's own name. */
  field?: string
  /**
   * Compare-at price (core-front O1): a variant with its own price inherits no compare-at price,
   * so on the product side a variant with an own price **or** own compare-at counts as overriding.
   */
  compareAt?: boolean
  /** Only variants of these kinds have the field (weight: physical). */
  onlyKinds?: readonly string[]
  /** Variants of these kinds don't have the field (tax: bundle). */
  exceptKinds?: readonly string[]
}

export function isSet(kind: InheritKind, value: unknown): boolean {
  switch (kind) {
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value)
    case 'array':
      return Array.isArray(value) && value.length > 0
    case 'i18n':
      return (
        Array.isArray(value) &&
        value.some((e) => typeof e?.value === 'string' && (e.value as string).trim() !== '')
      )
    case 'image':
      return !!(value as { asset?: { _ref?: string } } | null | undefined)?.asset?._ref
    case 'reference':
      return !!(value as { _ref?: string } | null | undefined)?._ref
    default:
      return false
  }
}

export type InheritDeps = {
  localizer: Pick<ITSLocalizer, 'value'>
  format: Pick<ITSFormatter, 'currency' | 'number'>
  /** `componentT.default` */
  t: TranslatorFunction
}

const MAX_TEXT = 80

export function truncate(text: string, max = MAX_TEXT): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max).trimEnd()}…` : flat
}

/** "Wein 20 % (W20)"; without a code just the title. */
export function taxLabel(tc: { title?: string | null; code?: string | null } | null | undefined) {
  if (!tc?.title) return undefined
  return tc.code ? `${tc.title} (${tc.code})` : tc.title
}

type Titled = { title?: unknown } | null | undefined
type Spec = { label?: unknown; value?: unknown } | null | undefined

/**
 * The value as hint text. Expects the shapes `useInheritedProduct` delivers: tax
 * `{ title (i18n), code }`, categories/manufacturers `[{ title (i18n) }]`, specifications
 * `[{ label, value }]` (i18n each). '' when there is nothing to show.
 */
export function formatInherited(format: InheritFormat, value: unknown, deps: InheritDeps): string {
  const { localizer, t } = deps
  switch (format) {
    case 'currency':
      return typeof value === 'number' ? deps.format.currency(value / 100) : ''
    case 'weight':
      return typeof value === 'number' ? `${deps.format.number(value)} g` : ''
    case 'tax': {
      const tc = value as { title?: unknown; code?: string | null } | null | undefined
      return taxLabel({ title: localizer.value<string>(tc?.title) ?? null, code: tc?.code }) ?? ''
    }
    case 'titles':
      return Array.isArray(value)
        ? value
            .map((v: Titled) => localizer.value<string>(v?.title))
            .filter(Boolean)
            .join(', ')
        : ''
    case 'specifications':
      return Array.isArray(value)
        ? truncate(
            value
              .map((s: Spec) =>
                [localizer.value<string>(s?.label), localizer.value<string>(s?.value)]
                  .filter(Boolean)
                  .join(': '),
              )
              .filter(Boolean)
              .join('; '),
          )
        : ''
    case 'text':
      return truncate(localizer.value<string>(value) ?? '')
    case 'image':
      return isSet('image', value) ? t('inheritance.productImage', 'Product image') : ''
    default:
      return ''
  }
}

export type InheritedProductValues = Record<string, unknown>

export type VariantHintInput = {
  spec: InheritSpec
  /** The variant field's own value. */
  own: unknown
  /** The product field name (already resolved from `spec.field`). */
  field: string
  published: InheritedProductValues | null
  /** null when the product has no draft. */
  draft: InheritedProductValues | null
  /** Shop default tax category (`{ title, code }`) — tax only. */
  shopDefaultTax?: unknown
  /** The variant has an own price (compare-at only). */
  variantHasOwnPrice?: boolean
}

/**
 * The sentence after the variant field's static description: what the variant uses now.
 * - empty: "Vom Produkt: 14,90 €" / "Vom Shop-Standard: …" / "Produkt hat keinen Wert." /
 *   compare-at with own price: "Kein Streichpreis (eigener Preis gesetzt)."
 * - set: "Eigener Wert — Produkt: 14,90 €. Feld leeren, um den Produktwert zu verwenden."
 * - plus "(Entwurf am Produkt: …)" when the product's draft has a different value.
 */
export function variantHint(input: VariantHintInput, deps: InheritDeps): string {
  const { spec, field, published, draft } = input
  const { t } = deps
  const text = (values: InheritedProductValues | null) => {
    const v = values?.[field]
    return isSet(spec.kind, v) ? formatInherited(spec.format, v, deps) : ''
  }
  const productText = text(published)
  const ownSet = isSet(spec.kind, input.own)

  let sentence: string
  if (ownSet) {
    sentence = productText
      ? t('inheritance.variant.own', `Own value — product: ${productText}.`, {
          value: productText,
        })
      : t('inheritance.variant.ownProductEmpty', 'Own value — the product has none.')
  } else if (spec.compareAt && input.variantHasOwnPrice) {
    sentence = t('inheritance.variant.noCompareAt', 'No compare-at price (own price set).')
  } else if (productText) {
    sentence = t('inheritance.variant.fromProduct', `From the product: ${productText}`, {
      value: productText,
    })
  } else if (spec.format === 'tax' && formatInherited('tax', input.shopDefaultTax, deps)) {
    const value = formatInherited('tax', input.shopDefaultTax, deps)
    sentence = t('inheritance.variant.fromShopDefault', `From the shop default: ${value}`, {
      value,
    })
  } else {
    sentence = t('inheritance.variant.productEmpty', 'The product has no value.')
  }

  if (draft) {
    const draftText = text(draft)
    if (draftText !== productText) {
      sentence += ` ${t('inheritance.variant.draftDiffers', `(Product draft: ${draftText})`, {
        value: draftText || t('inheritance.noValue', 'no value'),
      })}`
    }
  }
  return sentence
}

export type VariantRowForOverride = {
  _id: string
  kind?: string | null
  [field: string]: unknown
}

/** Variants that have this field at all (weight only physical, tax not on bundles). */
export function appliesTo(spec: InheritSpec, kind: string | null | undefined): boolean {
  if (spec.onlyKinds && !spec.onlyKinds.includes(kind ?? '')) return false
  if (spec.exceptKinds && spec.exceptKinds.includes(kind ?? '')) return false
  return true
}

/** Does this variant use its own value instead of the product's? */
export function overridesProduct(
  spec: InheritSpec,
  field: string,
  row: VariantRowForOverride,
): boolean {
  if (spec.compareAt) return isSet('number', row.price) || isSet('number', row[field])
  return isSet(spec.kind, row[field])
}

/** "Eigener Wert in 2 von 5 Varianten." — '' when no variant overrides the field. */
export function overrideSentence(overriding: number, total: number, t: TranslatorFunction) {
  if (overriding === 0) return ''
  return t('inheritance.product.overridden', `Own value in ${overriding} of ${total} variants.`, {
    n: overriding,
    count: total,
  })
}

/** The inheritable fields — one spec, used on both sides (variant `inherited`, product `inheritedBy`). */
export const INHERIT_SPECS = {
  title: { kind: 'i18n', format: 'text' },
  description: { kind: 'i18n', format: 'text' },
  specifications: { kind: 'array', format: 'specifications' },
  price: { kind: 'number', format: 'currency' },
  compareAtPrice: { kind: 'number', format: 'currency', compareAt: true },
  taxCategory: { kind: 'reference', format: 'tax', exceptKinds: ['bundle'] },
  categories: { kind: 'array', format: 'titles' },
  manufacturers: { kind: 'array', format: 'titles' },
  weight: { kind: 'number', format: 'weight', onlyKinds: ['physical'] },
  image: { kind: 'image', format: 'image' },
} as const satisfies Record<string, InheritSpec>
