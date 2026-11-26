import { describe, expect, it } from 'vitest'

import { mergeDrafts, productsWithTitle, wineProductsLike } from '../src/utils/existingProducts'
import {
  gridVolumes,
  gridWines,
  matchingWines,
  normalizeTitle,
  normalizeWineName,
  stripYear,
  visibleGridWines,
} from '../src/utils/wineName'

const wine = (id: string, title: string, year: string | null) => ({ id, title, year })

describe('wine names', () => {
  it('stripYear removes a trailing year only', () => {
    expect(stripYear('Ried Steinberg 2023')).toBe('Ried Steinberg')
    expect(stripYear('Ried Steinberg')).toBe('Ried Steinberg')
    expect(stripYear('1ÖTW 2019 Steinberg')).toBe('1ÖTW 2019 Steinberg')
  })
  it('normalizes case, accents and whitespace', () => {
    expect(normalizeTitle('  Grüner   Veltliner ')).toBe('gruner veltliner')
    expect(normalizeWineName('GRÜNER Veltliner  2022')).toBe('gruner veltliner')
  })
})

describe('grid rows', () => {
  const wines = [
    wine('a', 'Ried Steinberg 2021', '2021'),
    wine('b', 'Ried Steinberg 2023', '2023'),
    wine('c', 'ried  steinberg', null),
    wine('d', 'Steinberg 1ÖTW 2024', '2024'),
    wine('e', 'Zweigelt 2023', '2023'),
  ]
  it('matches by normalized name, seeds included', () => {
    expect(matchingWines(wines, ['a']).map((w) => w.id)).toEqual(['a', 'b', 'c'])
    expect(matchingWines(wines, []).map((w) => w.id)).toEqual([])
  })
  it('adds, removes and sorts newest first (no year last)', () => {
    expect(gridWines(wines, ['a'], ['d'], ['b']).map((w) => w.id)).toEqual(['d', 'a', 'c'])
    expect(gridWines(wines, ['a', 'e'], [], []).map((w) => w.id)).toEqual(['b', 'e', 'a', 'c'])
  })
  it('limits rows but keeps the ones to keep', () => {
    const rows = gridWines(wines, ['a'], ['d', 'e'], [])
    expect(visibleGridWines(rows, new Set(['c']), 2).map((w) => w.id)).toEqual(['d', 'b', 'c'])
  })
  it('columns: used volumes + 750 + added, unique, ascending', () => {
    expect(gridVolumes([1500, 375, 750], [3000])).toEqual([375, 750, 1500, 3000])
    expect(gridVolumes([], [])).toEqual([750])
  })
})

describe('existing products', () => {
  it('merges drafts by published id, draft wins', () => {
    expect(
      mergeDrafts([
        { _id: 'p1', title: 'Old' },
        { _id: 'drafts.p1', title: 'New', cmsTitle: 'internal' },
        { _id: 'drafts.p2', title: 'Draft only' },
      ]),
    ).toEqual([
      { id: 'p1', title: 'New', cmsTitle: 'internal' },
      { id: 'p2', title: 'Draft only' },
    ])
    expect(
      mergeDrafts([
        { _id: 'drafts.p1', title: 'New' },
        { _id: 'p1', title: 'Old' },
      ]),
    ).toEqual([{ id: 'p1', title: 'New' }])
  })
  it('finds products by normalized title', () => {
    const products = [
      { id: 'p1', title: 'T-Shirt Bio' },
      { id: 'p2', title: 'Hoodie' },
    ]
    expect(productsWithTitle(products, ' t-shirt  BIO').map((p) => p.id)).toEqual(['p1'])
    expect(productsWithTitle(products, '')).toEqual([])
  })
  it('finds wine products by title or by their wines’ names', () => {
    const products = [
      { id: 'p1', title: 'Steinberg' },
      { id: 'p2', title: 'Renamed product' },
      { id: 'p3', title: 'Zweigelt' },
    ]
    const variants = [
      { productId: 'drafts.p2', wineId: 'w1' },
      { productId: 'p3', wineId: 'w2' },
    ]
    const names = new Map([
      ['w1', 'Ried Steinberg 2021'],
      ['w2', 'Zweigelt 2023'],
    ])
    expect(
      wineProductsLike(products, variants, names, 'Ried Steinberg 2023').map((p) => p.id),
    ).toEqual(['p2'])
    expect(wineProductsLike(products, variants, names, 'Steinberg 2024').map((p) => p.id)).toEqual([
      'p1',
    ])
  })
})
