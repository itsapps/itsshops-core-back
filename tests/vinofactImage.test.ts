import { describe, expect, it, vi } from 'vitest'

import { vinofactEndpoint, vinofactLocaleKey, vinofactLocaleKeys } from '../src/external/vinofact'
import {
  bottleImageTargets,
  bottleImageUrl,
  buildLocaleAltImage,
  importBottleImages,
} from '../src/lib/shop/vinofactImage'
import type { VinofactBottleImage } from '../src/types/vinofact'

const img = (over: Partial<VinofactBottleImage> = {}): VinofactBottleImage => ({
  url: 'https://i.vinofact.com/r/rs:fit:{{width}}:{{height}}/plain/a.jpg',
  alt: { de: 'Flasche', en: 'Bottle' },
  width: 574,
  height: 2048,
  ...over,
})

const entry = (language: string, value: string, _key = `k-${language}`) => ({
  _key,
  _type: 'internationalizedArrayStringValue' as const,
  language,
  value,
})

describe('vinofactEndpoint', () => {
  it('uses only the origin and the dated path', () => {
    expect(vinofactEndpoint('https://www.vinofact.com/api/v1/graphql')).toBe(
      'https://www.vinofact.com/api/graphql/v2026-11-14/',
    )
    expect(vinofactEndpoint('http://192.168.178.48:8000/api/v1/graphql')).toBe(
      'http://192.168.178.48:8000/api/graphql/v2026-11-14/',
    )
  })

  it('defaults to www.vinofact.com', () => {
    expect(vinofactEndpoint('')).toBe('https://www.vinofact.com/api/graphql/v2026-11-14/')
    expect(vinofactEndpoint()).toBe('https://www.vinofact.com/api/graphql/v2026-11-14/')
  })

  it('throws on an invalid URL', () => {
    expect(() => vinofactEndpoint('not a url')).toThrow()
  })
})

describe('vinofactLocaleKey(s)', () => {
  it('camelCases hyphenated codes', () => {
    expect(vinofactLocaleKey('zh-cn')).toBe('zhCn')
    expect(vinofactLocaleKey('de')).toBe('de')
  })

  it('drops locales VinoFact does not have and duplicates', () => {
    expect(vinofactLocaleKeys(['de', 'en', 'xx', 'de', 'zh-cn'])).toEqual(['de', 'en', 'zhCn'])
  })
})

describe('bottleImageUrl', () => {
  it('fills the intrinsic size', () => {
    expect(bottleImageUrl(img())).toBe('https://i.vinofact.com/r/rs:fit:574:2048/plain/a.jpg')
  })

  it('falls back to 3000 when the size is unknown', () => {
    expect(bottleImageUrl(img({ width: null, height: null }))).toBe(
      'https://i.vinofact.com/r/rs:fit:3000:3000/plain/a.jpg',
    )
  })
})

describe('buildLocaleAltImage', () => {
  it('builds a localeAltImage with VinoFact alts per content locale', () => {
    const v = buildLocaleAltImage('image-abc', { de: 'Flasche', en: 'Bottle' }, ['de', 'en'])
    expect(v._type).toBe('localeAltImage')
    expect(v.asset).toEqual({ _type: 'reference', _ref: 'image-abc' })
    expect(v.alt?.map((e) => [e.language, e.value])).toEqual([
      ['de', 'Flasche'],
      ['en', 'Bottle'],
    ])
    expect(v).not.toHaveProperty('crop')
  })

  it('skips null locales and omits alt when none is left', () => {
    expect(
      buildLocaleAltImage('a', { de: 'Flasche', en: null }, ['de', 'en']).alt?.map(
        (e) => e.language,
      ),
    ).toEqual(['de'])
    expect(buildLocaleAltImage('a', { de: null, en: null }, ['de', 'en'])).not.toHaveProperty('alt')
    expect(buildLocaleAltImage('a', null, ['de'])).not.toHaveProperty('alt')
  })

  it('keeps an existing alt (same _key) and fills only empty locales', () => {
    const v = buildLocaleAltImage(
      'a',
      { de: 'VF de', en: 'VF en' },
      ['de', 'en'],
      [entry('de', 'Mein Text', 'keep-me'), entry('en', '   '), entry('fr', 'Bouteille')],
    )
    expect(v.alt).toHaveLength(2)
    expect(v.alt?.[0]).toEqual(entry('de', 'Mein Text', 'keep-me'))
    expect(v.alt?.[1]).toMatchObject({ language: 'en', value: 'VF en' })
    expect(v.alt?.[1]._key).not.toBe('k-en')
  })
})

describe('importBottleImages', () => {
  function setup(
    wines: { id: string; bottleImage: VinofactBottleImage | null }[],
    imageStatus = 200,
  ) {
    const commit = vi.fn().mockResolvedValue({})
    const set = vi.fn(() => ({ commit }))
    const client = {
      assets: { upload: vi.fn().mockResolvedValue({ _id: 'image-uploaded' }) },
      patch: vi.fn(() => ({ set })),
    }
    const vinofactClient = {
      getWines: vi.fn(),
      getBottleImages: vi.fn().mockResolvedValue({ wines }),
    }
    const fetchImpl = vi.fn(
      async () =>
        new Response(imageStatus === 200 ? new Blob(['x'], { type: 'image/jpeg' }) : 'nope', {
          status: imageStatus,
          headers: { 'content-type': imageStatus === 200 ? 'image/jpeg' : 'text/plain' },
        }),
    )
    const deps = { client: client as any, vinofactClient, locales: ['de', 'en'], fetchImpl }
    return { deps, client, set, vinofactClient }
  }

  it('imports, counts wines without image and ids VinoFact did not return', async () => {
    const { deps, client, set, vinofactClient } = setup([
      { id: '1', bottleImage: img() },
      { id: '2', bottleImage: null },
    ])
    const result = await importBottleImages(deps, [
      { variantId: 'drafts.v1', wineId: '1' },
      { variantId: 'v2', wineId: '2' },
      { variantId: 'v3', wineId: '3' },
    ])
    expect(result).toEqual({ imported: 1, noImage: 2, failed: 0 })
    expect(vinofactClient.getBottleImages).toHaveBeenCalledTimes(1)
    expect(vinofactClient.getBottleImages).toHaveBeenCalledWith(['1', '2', '3'], ['de', 'en'])
    expect(client.patch).toHaveBeenCalledWith('drafts.v1')
    expect(client.assets.upload).toHaveBeenCalledWith('image', expect.any(Blob), {
      filename: 'vinofact-1.jpg',
      source: { name: 'vinofact', id: '1', url: bottleImageUrl(img()) },
    })
    expect(set).toHaveBeenCalledWith({
      image: expect.objectContaining({ asset: { _type: 'reference', _ref: 'image-uploaded' } }),
    })
  })

  it('counts a failed download and goes on', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { deps, client } = setup([{ id: '1', bottleImage: img() }], 404)
    const result = await importBottleImages(deps, [{ variantId: 'v1', wineId: '1' }])
    expect(result).toEqual({ imported: 0, noImage: 0, failed: 1 })
    expect(client.patch).not.toHaveBeenCalled()
  })

  it('throws when the VinoFact request fails', async () => {
    const { deps, vinofactClient } = setup([])
    vinofactClient.getBottleImages.mockRejectedValueOnce(new Error('Invalid URL'))
    await expect(importBottleImages(deps, [{ variantId: 'v1', wineId: '1' }])).rejects.toThrow(
      'Invalid URL',
    )
  })

  it('does nothing without targets', async () => {
    const { deps, vinofactClient } = setup([])
    expect(await importBottleImages(deps, [])).toEqual({ imported: 0, noImage: 0, failed: 0 })
    expect(vinofactClient.getBottleImages).not.toHaveBeenCalled()
  })
})

describe('bottleImageTargets', () => {
  it('prefers the draft, skips variants with an image or without a VinoFact id', () => {
    const targets = bottleImageTargets([
      { _id: 'v1', wineId: '1', hasImage: false },
      { _id: 'drafts.v1', wineId: '1', hasImage: false, existingAlt: [entry('de', 'x')] },
      { _id: 'v2', wineId: '2', hasImage: false },
      { _id: 'v3', wineId: '3', hasImage: true },
      { _id: 'drafts.v4', wineId: '4', hasImage: true },
      { _id: 'v4', wineId: '4', hasImage: false },
      { _id: 'v5', wineId: null, hasImage: false },
    ])
    expect(targets).toEqual([
      { variantId: 'drafts.v1', wineId: '1', existingAlt: [entry('de', 'x')] },
      { variantId: 'v2', wineId: '2', existingAlt: undefined },
    ])
  })
})
