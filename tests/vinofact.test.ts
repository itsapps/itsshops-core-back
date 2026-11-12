import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { createVinofactClient } from '../src/external'

// Live call against the Vinofact API with the Studio's credentials from `.env`
// (SANITY_STUDIO_VINOFACT_API_URL / _PROFILE_SLUG, and the token as VINOFACT_API_TOKEN — no
// SANITY_STUDIO_ prefix, so the Studio build doesn't bundle it). Skipped when they're missing,
// e.g. in a checkout without `.env`.
if (existsSync('.env')) process.loadEnvFile('.env')
const endpoint = process.env.SANITY_STUDIO_VINOFACT_API_URL
const token = process.env.VINOFACT_API_TOKEN
const profileSlug = process.env.SANITY_STUDIO_VINOFACT_PROFILE_SLUG

describe.skipIf(!endpoint || !token || !profileSlug)('Vinofact (live, needs .env)', () => {
  it('gets wines', async () => {
    const client = createVinofactClient('de', endpoint!, token!, profileSlug!)
    const data = await client.getWines()

    expect(Array.isArray(data.wines)).toBe(true)
  })
})
