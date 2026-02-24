import { describe, expect, it } from 'vitest'

import { createVinofactClient } from '../src/external'

describe('Vinofact', () => {
  it('gets wines', async () => {
    const client = createVinofactClient(
      'de',
      'https://www.vinofact.com/api/v1/graphql',
      'xxx',
      'yyy',
    )
    const data = await client.getWines()

    expect(data).toBeDefined()
  })
})
