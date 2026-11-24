import { describe, expect, it } from 'vitest'

import { compareLabels, variantDetails, variantLabel } from '../src/utils/variantLabel'

const deps = {
  localizer: { value: (v: unknown) => (typeof v === 'string' ? v : undefined) } as never,
  format: {
    number: (n: number, o?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat('de-AT', o).format(n),
  },
}

describe('variantDetails', () => {
  it('wine: volume in litres + vintage', () => {
    expect(variantDetails(deps, { kind: 'wine', wineVolume: 750, wineVintage: '2023' })).toBe(
      '0,75 l • 2023',
    )
    expect(variantDetails(deps, { kind: 'wine', wineVintage: '2023' })).toBe('2023')
  })
  it('physical/digital: option titles', () => {
    expect(variantDetails(deps, { kind: 'physical', optionTitles: ['Rot', null, 'XL'] })).toBe(
      'Rot • XL',
    )
    expect(variantDetails(deps, { kind: 'digital', optionTitles: null })).toBe('')
  })
  it('other kinds: nothing', () => {
    expect(variantDetails(deps, { kind: 'bundle' })).toBe('')
  })
})

describe('variantLabel', () => {
  it('keeps vintage/volume when the variant has its own title', () => {
    expect(
      variantLabel(deps, {
        productTitle: 'Grüner Veltliner',
        title: 'Reserve',
        kind: 'wine',
        wineVolume: 750,
        wineVintage: '2023',
      }),
    ).toBe('Grüner Veltliner — Reserve — 0,75 l • 2023')
  })
  it('without a variant title: product + details', () => {
    expect(
      variantLabel(deps, { productTitle: 'Shirt', kind: 'physical', optionTitles: ['Rot', 'XL'] }),
    ).toBe('Shirt — Rot • XL')
  })
  it('leaves out empty parts', () => {
    expect(variantLabel(deps, { productTitle: 'Gutschein', kind: 'digital' })).toBe('Gutschein')
  })
})

describe('compareLabels', () => {
  it('sorts alphabetically, case-insensitive, numbers by value', () => {
    expect(['b', 'A', 'a 10', 'a 2'].sort(compareLabels)).toEqual(['A', 'a 2', 'a 10', 'b'])
  })
})
