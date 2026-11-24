import {
  ITSVinofactClient,
  VinofactBottleImagesResponse,
  VinofactWinesResponse,
} from '../types/vinofact'

/**
 * VinoFact's date-versioned GraphQL API this core speaks (vino-facts `.claude/graphql/versioning.md`).
 * The query shape lives in this file, so the version does too — never in an env var. Bump it
 * together with core-front's constant (same date) when VinoFact releases a change either needs;
 * never to a date after that VinoFact release (a future date answers 400).
 */
export const VINOFACT_API_VERSION = '2026-11-14'
export const VINOFACT_DEFAULT_ORIGIN = 'https://www.vinofact.com'

/**
 * The dated GraphQL endpoint. `endpoint` (`SANITY_STUDIO_VINOFACT_API_URL`, optional) only
 * overrides the origin, e.g. for a local VinoFact dev server — any path is ignored. An invalid
 * value throws `Invalid URL`.
 */
export function vinofactEndpoint(endpoint?: string): string {
  return `${new URL(endpoint || VINOFACT_DEFAULT_ORIGIN).origin}/api/graphql/v${VINOFACT_API_VERSION}/`
}

/**
 * VinoFact's `LocalizedString` fields (dated schema `v2026-11-14`). Selecting an unknown key fails
 * validation of the whole query, so only these may be selected. Copy the list again when bumping
 * `VINOFACT_API_VERSION`.
 */
export const VINOFACT_LOCALES = [
  'en',
  'de',
  'fr',
  'it',
  'pt',
  'cs',
  'es',
  'ru',
  'zhCn',
  'hi',
  'ja',
  'ar',
  'ko',
  'bg',
  'da',
  'et',
  'fi',
  'el',
  'hr',
  'lv',
  'lt',
  'nl',
  'pl',
  'ro',
  'sv',
  'sk',
  'sl',
  'hu',
  'tr',
  'he',
  'bn',
  'id',
  'th',
  'vi',
] as const

/** VinoFact's field name for a locale: graphene's camelCase of the language code (`zh-cn` → `zhCn`). */
export function vinofactLocaleKey(locale: string): string {
  return locale.toLowerCase().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

/** The selectable keys for these locales — unknown ones dropped, duplicates removed. */
export function vinofactLocaleKeys(locales: string[]): string[] {
  const known = new Set<string>(VINOFACT_LOCALES)
  return [...new Set(locales.map(vinofactLocaleKey))].filter((k) => known.has(k))
}

export const createVinofactClient = (
  locale: string,
  endpoint: string,
  token: string,
  profileSlug: string,
): ITSVinofactClient => {
  const defaultQueryParameters = {
    profileSlug,
  }
  const fetchData = async (query: string, variables = {}) => {
    try {
      // Built per request (not when the client is created), so a bad URL ends in the caller's
      // error toast instead of breaking the provider's render.
      const url = vinofactEndpoint(endpoint)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale,
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          query,
          variables: { ...variables, ...defaultQueryParameters },
        }),
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error('Invalid or missing Vinofact API Token.')
        throw new Error(`Vinofact API responded with status ${response.status}`)
      }

      const json = await response.json()
      const { data, errors } = json

      // 2. Check for GraphQL logic errors
      if (errors) {
        console.error('Vinofact GraphQL Errors:', errors)
        throw new Error(errors[0]?.message || 'Vinofact GraphQL query failed')
      }

      return data
    } catch (err) {
      const error = err as Error
      // Network error or thrown above
      console.error('Vinofact API call failed:', err)
      // throw err
      throw error
    }
  }

  const getWines = async (): Promise<VinofactWinesResponse> => {
    const query = `
      query ($profileSlug: String!) {
        wines(profileSlug: $profileSlug) {
          id
          slug
          title
          year
          editUrl
        }
      }
    `

    return await fetchData(query)
  }

  const getBottleImages = async (
    ids: string[],
    locales: string[],
  ): Promise<VinofactBottleImagesResponse> => {
    const keys = vinofactLocaleKeys(locales)
    // An empty selection set is invalid GraphQL — without a known locale, ask for none.
    const alt = keys.length ? `alt { ${keys.join(' ')} }` : ''
    const query = `
      query ($profileSlug: String!, $ids: [ID!]) {
        wines(profileSlug: $profileSlug, ids: $ids) {
          id
          bottleImage { url ${alt} width height }
        }
      }
    `
    const data: VinofactBottleImagesResponse = await fetchData(query, { ids })
    // Without an alt selection, normalise to the documented shape.
    if (!keys.length) {
      for (const w of data.wines) if (w.bottleImage) w.bottleImage.alt = null
    }
    return data
  }

  return {
    getWines,
    getBottleImages,
  }
}
