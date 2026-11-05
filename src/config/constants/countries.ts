import { countries as countryList, getEmojiFlag, TCountryCode } from 'countries-list'
import countries from 'i18n-iso-countries'
import deJson from 'i18n-iso-countries/langs/de.json'
import enJson from 'i18n-iso-countries/langs/en.json'

import type { Country, CountryOption } from '../../types'

export const createCountries = (locales: string[]): Country[] => {
  countries.registerLocale(deJson)
  countries.registerLocale(enJson)

  const eu = Object.entries(countryList).filter((entry) => {
    const value = entry[1]
    return value.continent === 'EU'
  })

  const euCountries = eu.map(([code, country]) => {
    const title: Record<string, string> = {}

    locales.forEach((locale) => {
      const name = countries.getName(code, locale)

      // Validation: Throw error if name is missing
      // i18n-iso-countries returns undefined if the locale/code combo fails
      if (!name) {
        throw new Error(
          `Missing translation for country code "${code}" in locale "${locale}". ` +
            `Ensure the locale is registered and the code is valid.`,
        )
      }

      title[locale] = name
    })

    return {
      title,
      code,
      emoji: getEmojiFlag(code as TCountryCode),
      // language: c[1].languages[0],
      continent: country.continent as string,
      currency: country.currency,
    }
  })

  return euCountries
}

/**
 * Every ISO 3166-1 alpha-2 country as a select option (`"AT (Österreich)"`), for addresses where a
 * person says where they *live* (customer account, a customer's interest list). Delivery, tax and
 * the shop's own address keep the shop's list (`countryOptions`). Names from `Intl.DisplayNames`,
 * the same source as core-front's `countryList` filter, so Studio and website match.
 */
export const createAllCountryOptions = (locale: string): CountryOption[] => {
  let names: Intl.DisplayNames
  try {
    names = new Intl.DisplayNames([locale], { type: 'region' })
  } catch {
    names = new Intl.DisplayNames(['en'], { type: 'region' })
  }
  return Object.keys(countries.getAlpha2Codes())
    .sort()
    .map((code) => ({ title: `${code} (${names.of(code) ?? code})`, value: code }))
}
