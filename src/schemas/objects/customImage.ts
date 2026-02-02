import { ITSSchemaDefinition } from '../../types';

export const customImage: ITSSchemaDefinition = {
  name: 'customImage',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('image', 'image', { options: { hotspot: true } }),
        f('title', 'string'),
        f('alt', 'string'),
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
            title,
            subtitle: alt,
            media: image?.asset,
            // media: ctx.getLocalizedValue(image)?.asset,
          };
        },
      },
    }
  }
}
