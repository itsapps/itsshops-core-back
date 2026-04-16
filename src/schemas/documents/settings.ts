import { MenuIcon, SearchIcon, SettingsIcon, UserIcon, WebsiteIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const settings: ITSDocumentDefinition = {
  name: 'settings',
  type: 'document',
  icon: SettingsIcon,
  isSingleton: true,
  build: (ctx) => {
    const { f, t } = ctx
    return ctx.builders.buildGroupedSchema([
      {
        name: 'site',
        icon: WebsiteIcon,
        fields: [
          f('siteTitle', 'i18nString'),
          f('siteShortDescription', 'i18nString'),
          f('defaultShareImage', 'image'),
        ],
      },
      {
        name: 'displays',
        icon: MenuIcon,
        fields: [
          f('homePage', 'reference', {
            to: [{ type: 'page' }],
          }),
          f('privacyPage', 'reference', {
            to: [{ type: 'page' }],
          }),
          f('mainMenus', 'array', {
            of: [{ type: 'reference', title: t.default('menu.title'), to: [{ type: 'menu' }] }],
          }),
          f('footerMenus', 'array', {
            of: [{ type: 'reference', title: t.default('menu.title'), to: [{ type: 'menu' }] }],
          }),
        ],
      },
      {
        name: 'analytics',
        icon: SearchIcon,
        fields: [f('gtmId', 'string')],
      },
      {
        name: 'company',
        icon: UserIcon,
        fields: [f('company', 'company')],
      },
    ])
  },
}
