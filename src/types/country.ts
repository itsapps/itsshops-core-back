import type { ITSi18nDictValue } from "./localization";

// import { TContinentCode } from 'countries-list'

export type Country = {
  title: ITSi18nDictValue;
  code: string;
  emoji: string;
  continent: string;
  currency: string[];
}

export type CountryOption = {
  title: string;
  value: string;
}