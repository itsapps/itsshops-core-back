import type { Country } from '../types';
import countries from 'i18n-iso-countries'
import deJson from 'i18n-iso-countries/langs/de.json';
import enJson from 'i18n-iso-countries/langs/en.json';
import { countries as countryList, getEmojiFlag, TCountryCode } from 'countries-list'

export const createCountries = (locales: string[]): Country[] => {
  countries.registerLocale(deJson);
  countries.registerLocale(enJson);

  const euCountries = Object.entries(countryList).filter(([code, country]) => {
    return country.continent === 'EU'
  }).map(([code, country]) => {
    const title: Record<string, string> = {};

    locales.forEach((locale) => {
      const name = countries.getName(code, locale);

      // Validation: Throw error if name is missing 
      // i18n-iso-countries returns undefined if the locale/code combo fails
      if (!name) {
        throw new Error(
          `Missing translation for country code "${code}" in locale "${locale}". ` +
          `Ensure the locale is registered and the code is valid.`
        );
      }

      title[locale] = name;
    });

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
