import { ITSDocumentDefinition } from "../../types";
import { CogIcon } from '@sanity/icons'
import { FieldDefinition } from 'sanity';


export const settings: ITSDocumentDefinition = {
  name: 'settings',
  type: 'document',
  icon: CogIcon,
  isSingleton: true,
  build: (ctx) => {
    const { f } = ctx;

    const groups = ['site', 'displays', 'analytics', 'company' ].map((name, index) => ({
      name, ...index === 0 && { default: true }
    }));

    const fieldsMap: Record<string, FieldDefinition[]> = {
      site: [
        f('siteTitle', 'i18nString'),
        f('siteShortDescription', 'i18nString'),
        f('siteDescription', 'i18nText'),
      ],
      displays: [
        f('homePage', 'reference', {
          to: [{ type: 'page' }],
        }),
        f('privacyPage', 'reference', {
          to: [{ type: 'page' }],
        }),
        f('mainMenus', 'array', {
          of: [{ type: 'reference', to: [{ type: 'menu', }]}],
        }),
        f('footerMenus', 'array', {
          of: [{ type: 'reference', to: [{ type: 'menu', }]}],
        }),
      ],
      analytics: [
        f('gtmId', 'string')
      ],
      company: [
        f('company', 'company')
      ],
    }
    const fields = groups.map(({ name }) => ([
      ...fieldsMap[name].map(field => ({ ...field, group: name }))
    ])).flat();

    return {
      groups,
      fields,
    }
  }
};
