import { Language } from '../../types'

export const studioUILanguages: Language[] = [
  {
    id: 'de',
    title: 'Deutsch',
    locale: 'de-DE',
    weekInfo: { firstDay: 1, weekend: [6, 7], minimalDays: 5 },
  },
  {
    id: 'en',
    title: 'English',
    locale: 'en-US',
    weekInfo: { firstDay: 1, weekend: [6, 7], minimalDays: 5 },
  },
]
export const fieldUILanguages: Language[] = [
  ...studioUILanguages,
  // {
  //   id: 'fr',
  //   title: 'Français',
  //   locale: 'fr-FR',
  //   weekInfo: { firstDay: 1, weekend: [6, 7], minimalDays: 5 },
  // },
]
