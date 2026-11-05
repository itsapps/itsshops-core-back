import countries from 'i18n-iso-countries'

import type { Country, CountryOption } from '../../types'

/**
 * The shop's countries: geographic Europe (the 52 codes the former `countries-list` continent
 * filter `EU` produced). Used for what a shop sells/delivers to or is — tax countries, shipping,
 * order and shop addresses (`ctx.constants.countryOptions`).
 */
// prettier-ignore
export const EUROPE_COUNTRY_CODES = [
  'AD', 'AL', 'AT', 'AX', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FO', 'FR', 'GB', 'GG', 'GI', 'GR', 'HR', 'HU', 'IE', 'IM', 'IS', 'IT', 'JE', 'LI', 'LT', 'LU',
  'LV', 'MC', 'MD', 'ME', 'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'SE', 'SI', 'SJ', 'SK',
  'SM', 'UA', 'VA', 'XK',
] as const

/** Localized country names from `Intl.DisplayNames` (same source as core-front's `countryList`). */
function regionNames(locale: string): Intl.DisplayNames {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' })
  } catch {
    return new Intl.DisplayNames(['en'], { type: 'region' })
  }
}

/** Flag emoji for an ISO alpha-2 code (regional indicator symbols), e.g. `AT` → 🇦🇹. */
export const flagEmoji = (code: string): string =>
  String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))

/** The shop's countries with a name per UI locale (`config.localization.countries`). */
export const createCountries = (locales: string[]): Country[] => {
  const names = locales.map((locale) => [locale, regionNames(locale)] as const)
  return EUROPE_COUNTRY_CODES.map((code) => ({
    code,
    title: Object.fromEntries(names.map(([locale, n]) => [locale, n.of(code) ?? code])),
  }))
}

/**
 * Every ISO 3166-1 alpha-2 country as a select option (`"AT (Österreich)"`), for addresses where a
 * person says where they *live* (customer account, a customer's interest list). Delivery, tax and
 * the shop's own address keep the shop's list (`countryOptions`).
 */
export const createAllCountryOptions = (locale: string): CountryOption[] => {
  const names = regionNames(locale)
  return Object.keys(countries.getAlpha2Codes())
    .sort()
    .map((code) => ({ title: `${code} (${names.of(code) ?? code})`, value: code }))
}
