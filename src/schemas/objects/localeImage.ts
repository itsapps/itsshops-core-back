import { CoreObject, FieldContext } from '../../types';

export const localeImage: CoreObject = {
  name: 'localeImage',
  type: 'object',
  build: (ctx: FieldContext) => {
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
            title: ctx.helpers.localizer.value(title) || 'No title',
            subtitle: ctx.helpers.localizer.value(alt) || 'No alt',
            media: ctx.helpers.localizer.value(media),
          };
        },
      },
    }
  }
}
