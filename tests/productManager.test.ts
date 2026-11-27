import { describe, expect, it } from 'vitest'

import { categoryTree, parseStock, parseWholeNumber } from '../src/utils/productManager'

describe('numbers', () => {
  it('parseWholeNumber', () => {
    expect(parseWholeNumber('3', 1)).toBe(3)
    expect(parseWholeNumber(' 12 ', 1)).toBe(12)
    expect(parseWholeNumber('0', 1)).toBeUndefined()
    expect(parseWholeNumber('2,5', 1)).toBeUndefined()
    expect(parseWholeNumber('2.5', 1)).toBeUndefined()
    expect(parseWholeNumber('-1', 0)).toBeUndefined()
    expect(parseWholeNumber('', 1)).toBeUndefined()
  })
  it('parseStock: empty = unlimited, else whole ≥ 0', () => {
    expect(parseStock('')).toEqual({ valid: true, value: undefined })
    expect(parseStock('0')).toEqual({ valid: true, value: 0 })
    expect(parseStock('24')).toEqual({ valid: true, value: 24 })
    expect(parseStock('x')).toEqual({ valid: false, value: undefined })
  })
})

describe('categoryTree', () => {
  const cats = [
    { _id: 'white', title: 'Weiß', parentId: 'wine' },
    { _id: 'wine', title: 'Wein' },
    { _id: 'gv', title: 'Grüner Veltliner', parentId: 'white' },
    { _id: 'orphan', title: 'Orphan', parentId: 'gone' },
    { _id: 'gifts', title: 'Geschenke', parentId: null },
  ]
  it('nests depth-first, orphans on top level', () => {
    expect(categoryTree(cats, true).map((c) => `${c.depth}:${c._id}`)).toEqual([
      '0:wine',
      '1:white',
      '2:gv',
      '0:orphan',
      '0:gifts',
    ])
  })
  it('flat without subcategories', () => {
    expect(categoryTree(cats, false).every((c) => c.depth === 0)).toBe(true)
    expect(categoryTree(cats, false)).toHaveLength(5)
  })
  it('survives a cycle', () => {
    const cyc = [
      { _id: 'a', title: 'A', parentId: 'b' },
      { _id: 'b', title: 'B', parentId: 'a' },
    ]
    expect(
      categoryTree(cyc, true)
        .map((c) => c._id)
        .sort(),
    ).toEqual(['a', 'b'])
  })
})
