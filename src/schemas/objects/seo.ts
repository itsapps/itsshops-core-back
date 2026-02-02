import { ITSSchemaDefinition } from '../../types';

export const seo: ITSSchemaDefinition = {
  name: 'seo',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('metaTitle', 'i18nString', { i18n: { max: 50, warning: true } }),
        f('metaDescription', 'i18nString', { i18n: { max: 150, warning: true } }),
        f('shareTitle', 'i18nString', { i18n: { max: 50, warning: true } }),
        f('shareDescription', 'i18nString', { i18n: { max: 150, warning: true } }),
        f('shareImage', 'i18nImage'),
        f('keywords', 'i18nString'),
      ]
    }
  }
}