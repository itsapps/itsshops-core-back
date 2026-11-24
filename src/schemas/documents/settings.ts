import {
  MenuIcon,
  NotificationIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
  WebsiteIcon,
} from '../../assets/icons'
import { ITSDocumentDefinition, ITSFeatureKey } from '../../types'
import { requiredSubfields } from '../../utils/validation'

export const settings: ITSDocumentDefinition = {
  name: 'settings',
  type: 'document',
  icon: SettingsIcon,
  isSingleton: true,
  build: (ctx) => {
    const { f, t } = ctx
    // Order, withdrawal, account and newsletter mails need a sender and the
    // site title (shop name) — the frontend's notifiers throw without them.
    const mailFeatures: ITSFeatureKey[] = ['shop', 'users', 'newsletter']
    const sendsMail = mailFeatures.some((feature) => ctx.featureRegistry.isFeatureEnabled(feature))
    const shopEnabled = ctx.featureRegistry.isFeatureEnabled('shop')
    return ctx.builders.buildGroupedSchema([
      {
        name: 'site',
        icon: WebsiteIcon,
        fields: [
          f('siteTitle', 'i18nString', sendsMail ? { i18n: 'requiredDefault' } : {}),
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
          // Linked from the newsletter, registration and checkout forms.
          f('privacyPage', 'reference', {
            to: [{ type: 'page' }],
            validation: (rule) => (sendsMail ? rule.required() : rule),
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
        name: 'notifications',
        icon: NotificationIcon,
        fields: [
          f('senderName', 'string', {
            validation: (rule) => (sendsMail ? rule.required() : rule),
          }),
          f('senderEmail', 'string', {
            validation: (rule) => (sendsMail ? rule.required().email() : rule.email()),
          }),
          // Inbox for every mail *to the shop* (order copies, withdrawals); empty → senderEmail.
          f('shopNotificationEmail', 'string', {
            hidden: !shopEnabled,
            validation: (rule) => rule.email(),
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
        fields: [
          // Invoices and the generated withdrawal instructions read these.
          f(
            'company',
            'company',
            shopEnabled
              ? {
                  validation: requiredSubfields(
                    [
                      'name',
                      'address.line1',
                      'address.zip',
                      'address.city',
                      'address.country',
                      'email',
                      'vatId',
                    ],
                    ctx.t.default,
                    { warning: true, message: 'validation.companyDetailsRecommended' },
                  ),
                }
              : {},
          ),
        ],
      },
    ])
  },
}
