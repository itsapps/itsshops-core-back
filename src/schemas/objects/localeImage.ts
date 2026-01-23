// packages/core-back/src/schemas/objects/localeImage.ts
import { getI18nValue } from '../../utils/localization';
import { SchemaContext, FieldFactory } from '../../types';

export const localeImage = (ctx: SchemaContext, f: FieldFactory ) => {
  const { t, config } = ctx;
  return {
    type: 'image',
    name: 'localeImage',
    title: t('localeImage.schemaTitle'),
    options: { hotspot: true },
    fields: [
      f('title', 'i18nString'),
      f('alt', 'i18nString'),
    ],
    preview: {
      select: {
        title: 'title',
        alt: 'alt',
        media: 'asset',
      },
      prepare: ({ title, alt, media }: any) => {
        const defaultLocale = config.localization.defaultLocale;
        return {
          // We use our new array-based helper here
          title: getI18nValue(title, defaultLocale),
          subtitle: getI18nValue(alt, defaultLocale),
          media: media,
        };
      },
    },
  };
};