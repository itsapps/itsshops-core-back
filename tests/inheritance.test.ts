import { describe, expect, it } from 'vitest'

import {
  inheritedPriceLabel,
  inheritedTaxLabel,
} from '../src/components/products/productManager/fields/inherited'
import {
  appliesTo,
  formatInherited,
  INHERIT_SPECS,
  isSet,
  overrideSentence,
  overridesProduct,
  taxLabel,
  variantHint,
} from '../src/utils/inheritance'

// Fallback-like translator: returns the fallback, else the key with params.
const t = (key: string, fallback?: string, params?: Record<string, unknown>) =>
  fallback ?? `${key}${params ? JSON.stringify(params) : ''}`

const localizer = {
  value: <T>(data: unknown) => {
    if (!Array.isArray(data)) return undefined
    const de = data.find((e) => e?.language === 'de' && e.value)
    return (de ?? data.find((e) => e?.value))?.value as T | undefined
  },
}
const format = {
  currency: (n: number) => `${n.toFixed(2).replace('.', ',')} €`,
  number: (n: number, o?: Intl.NumberFormatOptions) => new Intl.NumberFormat('de-AT', o).format(n),
}
const deps = { localizer, format, t }
const i18n = (value: string, language = 'de') => [{ _key: language, language, value }]

describe('isSet', () => {
  it('number: 0 is set, null/undefined not', () => {
    expect(isSet('number', 0)).toBe(true)
    expect(isSet('number', 1490)).toBe(true)
    expect(isSet('number', null)).toBe(false)
    expect(isSet('number', undefined)).toBe(false)
  })
  it('array: empty array is not set', () => {
    expect(isSet('array', [])).toBe(false)
    expect(isSet('array', [{ _ref: 'a' }])).toBe(true)
    expect(isSet('array', null)).toBe(false)
  })
  it('i18n: needs a non-blank entry', () => {
    expect(isSet('i18n', [])).toBe(false)
    expect(isSet('i18n', i18n('   '))).toBe(false)
    expect(isSet('i18n', [{ language: 'de' }])).toBe(false)
    expect(isSet('i18n', [...i18n(''), ...i18n('Reserve', 'en')])).toBe(true)
  })
  it('image: needs an asset ref', () => {
    expect(isSet('image', { alt: [] })).toBe(false)
    expect(isSet('image', { asset: { _ref: 'image-1' } })).toBe(true)
  })
  it('reference: needs a ref', () => {
    expect(isSet('reference', {})).toBe(false)
    expect(isSet('reference', { _ref: 'tax-1' })).toBe(true)
  })
})

describe('formatInherited', () => {
  it('currency from cents, price 0', () => {
    expect(formatInherited('currency', 1490, deps)).toMatch(/14,90/)
    expect(formatInherited('currency', 0, deps)).toMatch(/0,00/)
  })
  it('weight in grams', () => {
    expect(formatInherited('weight', 750, deps)).toBe('750 g')
  })
  it('tax: title + code', () => {
    expect(formatInherited('tax', { title: i18n('Wein 20 %'), code: 'W20' }, deps)).toBe(
      'Wein 20 % (W20)',
    )
    expect(formatInherited('tax', null, deps)).toBe('')
  })
  it('titles joined, empty entries dropped', () => {
    expect(
      formatInherited(
        'titles',
        [{ title: i18n('Rot') }, { title: [] }, { title: i18n('Bio') }],
        deps,
      ),
    ).toBe('Rot, Bio')
  })
  it('text truncated to 80 chars', () => {
    const long = 'a'.repeat(100)
    const out = formatInherited('text', i18n(long), deps)
    expect(out).toHaveLength(81)
    expect(out.endsWith('…')).toBe(true)
  })
  it('specifications as label: value', () => {
    expect(
      formatInherited(
        'specifications',
        [{ label: i18n('Material'), value: i18n('Baumwolle') }],
        deps,
      ),
    ).toBe('Material: Baumwolle')
  })
  it('image: a word, only with an asset', () => {
    expect(formatInherited('image', { asset: { _ref: 'x' } }, deps)).toBe('Product image')
    expect(formatInherited('image', {}, deps)).toBe('')
  })
})

describe('taxLabel', () => {
  it('without code just the title, without title nothing', () => {
    expect(taxLabel({ title: 'Wein', code: null })).toBe('Wein')
    expect(taxLabel({ title: '', code: 'W' })).toBeUndefined()
  })
})

describe('variantHint', () => {
  const base = { field: 'price', draft: null }
  it('empty → from the product', () => {
    expect(
      variantHint(
        { ...base, spec: INHERIT_SPECS.price, own: undefined, published: { price: 1490 } },
        deps,
      ),
    ).toMatch(/^From the product: 14,90/)
  })
  it('product price 0 is a value', () => {
    expect(
      variantHint(
        { ...base, spec: INHERIT_SPECS.price, own: undefined, published: { price: 0 } },
        deps,
      ),
    ).toMatch(/^From the product: 0,00/)
  })
  it('own value → names the product value', () => {
    expect(
      variantHint(
        { ...base, spec: INHERIT_SPECS.price, own: 1200, published: { price: 1490 } },
        deps,
      ),
    ).toMatch(/^Own value — product: 14,90/)
  })
  it('product empty', () => {
    expect(
      variantHint({ ...base, spec: INHERIT_SPECS.price, own: undefined, published: {} }, deps),
    ).toBe('The product has no value.')
    expect(variantHint({ ...base, spec: INHERIT_SPECS.price, own: 5, published: null }, deps)).toBe(
      'Own value — the product has none.',
    )
  })
  it('compare-at: own price → no inherited compare-at (O1)', () => {
    const input = {
      spec: INHERIT_SPECS.compareAtPrice,
      field: 'compareAtPrice',
      own: undefined,
      published: { compareAtPrice: 1990 },
      draft: null,
    }
    expect(variantHint({ ...input, variantHasOwnPrice: true }, deps)).toBe(
      'No compare-at price (own price set).',
    )
    expect(variantHint({ ...input, variantHasOwnPrice: false }, deps)).toMatch(
      /^From the product: 19,90/,
    )
  })
  it('tax: falls back to the shop default', () => {
    expect(
      variantHint(
        {
          spec: INHERIT_SPECS.taxCategory,
          field: 'taxCategory',
          own: undefined,
          published: { taxCategory: null },
          draft: null,
          shopDefaultTax: { _ref: 't', title: i18n('Normal'), code: 'N20' },
        },
        deps,
      ),
    ).toBe('From the shop default: Normal (N20)')
  })
  it('draft with a different value is appended', () => {
    const out = variantHint(
      {
        ...base,
        spec: INHERIT_SPECS.price,
        own: undefined,
        published: { price: 1490 },
        draft: { price: 1590 },
      },
      deps,
    )
    expect(out).toMatch(/From the product: 14,90.*\(Product draft: 15,90/)
    // same value in the draft → nothing appended
    expect(
      variantHint(
        {
          ...base,
          spec: INHERIT_SPECS.price,
          own: undefined,
          published: { price: 1490 },
          draft: { price: 1490 },
        },
        deps,
      ),
    ).not.toMatch(/draft/)
  })
  it('categories: empty array inherits', () => {
    expect(
      variantHint(
        {
          spec: INHERIT_SPECS.categories,
          field: 'categories',
          own: [],
          published: { categories: [{ _ref: 'c', title: i18n('Rotwein') }] },
          draft: null,
        },
        deps,
      ),
    ).toBe('From the product: Rotwein')
  })
})

describe('product side', () => {
  it('compare-at: own price or own compare-at overrides', () => {
    const spec = INHERIT_SPECS.compareAtPrice
    expect(overridesProduct(spec, 'compareAtPrice', { _id: 'a', price: 100 })).toBe(true)
    expect(overridesProduct(spec, 'compareAtPrice', { _id: 'a', compareAtPrice: 100 })).toBe(true)
    expect(overridesProduct(spec, 'compareAtPrice', { _id: 'a' })).toBe(false)
  })
  it('empty arrays and blank i18n do not override', () => {
    expect(
      overridesProduct(INHERIT_SPECS.categories, 'categories', { _id: 'a', categories: [] }),
    ).toBe(false)
    expect(overridesProduct(INHERIT_SPECS.title, 'title', { _id: 'a', title: i18n(' ') })).toBe(
      false,
    )
  })
  it('kinds the field applies to', () => {
    expect(appliesTo(INHERIT_SPECS.weight, 'physical')).toBe(true)
    expect(appliesTo(INHERIT_SPECS.weight, 'wine')).toBe(false)
    expect(appliesTo(INHERIT_SPECS.taxCategory, 'bundle')).toBe(false)
    expect(appliesTo(INHERIT_SPECS.taxCategory, 'wine')).toBe(true)
  })
  it('sentence only when something overrides', () => {
    expect(overrideSentence(0, 5, t)).toBe('')
    expect(overrideSentence(2, 5, t)).toBe('Own value in 2 of 5 variants.')
  })
})

describe('Product Manager labels', () => {
  const componentT = { default: t, strict: () => undefined } as never
  it('inheritedPriceLabel: a product price of 0 is a price', () => {
    expect(inheritedPriceLabel(componentT, format, 0)).toContain('"price"')
    expect(inheritedPriceLabel(componentT, format, undefined)).toBeUndefined()
  })
  it('inheritedTaxLabel: product, then shop default, then none', () => {
    const cats = [
      { _id: 'a', title: 'Wein 20 %', code: 'W20' },
      { _id: 'b', title: 'Normal', code: 'N' },
    ]
    expect(inheritedTaxLabel(componentT, cats, 'a', 'b')).toContain('Wein 20 % (W20)')
    expect(inheritedTaxLabel(componentT, cats, undefined, 'b')).toContain('taxShopDefault')
    expect(inheritedTaxLabel(componentT, cats, undefined, undefined)).toBe(
      'productCreatorTool.inherited.taxNone',
    )
  })
})
