import { describe, it, expect } from 'vitest'

import { createAllCountryOptions } from '../src/config/constants/countries'

describe('createAllCountryOptions', () => {
  it('lists every ISO country with a localized name, sorted by code', () => {
    const de = createAllCountryOptions('de')
    expect(de.length).toBeGreaterThan(240)
    expect(de).toContainEqual({ title: 'AT (Österreich)', value: 'AT' })
    expect(de).toContainEqual({ title: 'US (Vereinigte Staaten)', value: 'US' })
    expect(de.map((o) => o.value)).toEqual([...de.map((o) => o.value)].sort())
    expect(createAllCountryOptions('en')).toContainEqual({ title: 'JP (Japan)', value: 'JP' })
  })

  it('falls back to English names for an unknown locale', () => {
    expect(createAllCountryOptions('not a locale')).toContainEqual({
      title: 'DE (Germany)',
      value: 'DE',
    })
  })
})
