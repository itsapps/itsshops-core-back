import { ITSSchemaDefinition } from '../../types'

export const seo: ITSSchemaDefinition = {
  name: 'seo',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('metaTitle', 'i18nString', { i18n: { max: 60, warning: true } }),
        f('metaDescription', 'i18nString', { i18n: { max: 155, warning: true } }),
        f('shareTitle', 'i18nString', { i18n: { max: 60, warning: true } }),
        f('shareDescription', 'i18nString', { i18n: { max: 155, warning: true } }),
        f('shareImage', 'localeAltImage'),
      ],
    }
  },
}
