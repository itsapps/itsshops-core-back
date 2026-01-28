import { CoreObject } from '../../types';

export const localeImage: CoreObject = {
  name: 'localeImage',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('image', 'i18nImage' ),
        f('title', 'i18nString'),
        f('alt', 'i18nString'),
      ],
      preview: {
        select: {
          title: 'title',
          alt: 'alt',
          media: 'image',
        },
        prepare: ({ title, alt, media }: any) => {
          return {
            // We use our new array-based helper here
            // title,
            // subtitle: alt,
            title: ctx.localizer.value(title) || 'No title',
            subtitle: ctx.localizer.value(alt) || 'No alt',
            media: ctx.localizer.value(media),
          };
        },
      },
    }
  }
}
