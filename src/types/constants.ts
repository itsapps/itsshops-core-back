import type { ITSi18nDictValue } from './localization'

export type Country = {
  title: ITSi18nDictValue
  code: string
}

export type CountryOption = {
  title: string
  value: string
}

export type VolumeOption = {
  title: string
  value: number
}
