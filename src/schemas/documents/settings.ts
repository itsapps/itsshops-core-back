import { SettingsIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const settings: ITSDocumentDefinition = {
  name: 'settings',
  type: 'document',
  icon: SettingsIcon,
  isSingleton: true,
  build: (ctx) => {
    const { f } = ctx
    return ctx.builders.buildGroupedSchema([
      {
        name: 'site',
        icon: SettingsIcon,
        fields: [
          f('siteTitle', 'i18nString'),
          f('siteShortDescription', 'i18nString'),
          f('siteDescription', 'i18nText'),
        ],
      },
      {
        name: 'displays',
        fields: [
          f('homePage', 'reference', {
            to: [{ type: 'page' }],
          }),
          f('privacyPage', 'reference', {
            to: [{ type: 'page' }],
          }),
          f('mainMenus', 'array', {
            of: [{ type: 'reference', to: [{ type: 'menu' }] }],
          }),
          f('footerMenus', 'array', {
            of: [{ type: 'reference', to: [{ type: 'menu' }] }],
          }),
        ],
      },
      {
        name: 'analytics',
        fields: [f('gtmId', 'string')],
      },
      {
        name: 'company',
        fields: [f('company', 'company')],
      },
    ])
  },
}
