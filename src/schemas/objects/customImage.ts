import { CoreObject, FieldContext } from '../../types';

export const customImage: CoreObject = {
  name: 'customImage',
  type: 'object',
  build: (ctx: FieldContext) => {
    const { f } = ctx;
    return {
      fields: [
        // f('image', 'i18nImage', { options: { hotspot: true } }),
        f('title', 'i18nString'),
        f('alt', 'i18nString'),
      ],
      preview: {
        select: {
          image: 'image',
          title: 'title',
          alt: 'alt',
        },
        prepare: ({ image, title, alt }: any) => {
          return {
            // We use our new array-based helper here
            title: ctx.getLocalizedValue(title) || 'No title',
            subtitle: ctx.getLocalizedValue(alt) || 'No alt',
            media: image?.asset,
            // media: ctx.getLocalizedValue(image)?.asset,
          };
        },
      },
    }
  }
}
