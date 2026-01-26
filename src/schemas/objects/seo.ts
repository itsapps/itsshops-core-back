import { CoreObject, FieldContext } from '../../types';

export const seo: CoreObject = {
  name: 'seo',
  type: 'object',
  build: (ctx: FieldContext) => {
    const { f } = ctx;
    return {
      fields: [
        f('metaTitle', 'i18nString', { i18n: { max: 50, warning: true } }),
        f('metaDescription', 'i18nString', { i18n: { max: 150, warning: true } }),
        f('shareTitle', 'i18nString', { i18n: { max: 50, warning: true } }),
        f('shareDescription', 'i18nString', { i18n: { max: 150, warning: true } }),
        f('shareImage', 'image', { options: { hotspot: true } }),
        f('keywords', 'i18nString'),
      ]
    }
  }
}