import { describe, expect, it } from 'vitest'

import { mapConfig } from '../src/config/mapper'

const base = { settings: {} } as Parameters<typeof mapConfig>[0]

describe('mapConfig → features.shop.vinofact', () => {
  it('defaults: off, no bottle images', () => {
    expect(mapConfig(base).features.shop.vinofact).toEqual({
      enabled: false,
      importBottleImages: false,
    })
  })

  it('enabled without the flag: bottle images stay off', () => {
    const config = { ...base, features: { shop: { vinofact: { enabled: true } } } }
    expect(mapConfig(config).features.shop.vinofact).toEqual({
      enabled: true,
      importBottleImages: false,
    })
  })

  it('importBottleImages is passed through', () => {
    const config = {
      ...base,
      features: { shop: { vinofact: { enabled: true, importBottleImages: true } } },
    }
    expect(mapConfig(config).features.shop.vinofact.importBottleImages).toBe(true)
  })
})
