import { ITSSchemaDefinition } from '../../types';

export const localeImage: ITSSchemaDefinition = {
  name: 'localeImage',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx;
    return {
      groups: [
        { name: 'image', title: 'Image', default: true },
        { name: 'texts', title: 'Texts' },
      ],
      fields: [
        f('image', 'i18nCropImage', { group: 'image'} ),
        f('title', 'i18nString', { group: 'texts' }),
        f('alt', 'i18nString', { group: 'texts' }),
      ],
      preview: {
        select: {
          title: 'title',
          alt: 'alt',
          media: 'image',
        },
        prepare: ({ title, alt, media }) => {
          const image = ctx.localizer.value<any>(media)
          return {
            // We use our new array-based helper here
            // title,
            // subtitle: alt,
            title: ctx.localizer.value(title) || '',
            subtitle: ctx.localizer.value(alt) || '',
            media: image,
          };
        },
      },
    }
  }
}
