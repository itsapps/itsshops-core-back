import { ITSSchemaDefinition } from '../../types';

export const cropImage: ITSSchemaDefinition = {
  name: 'cropImage',
  type: 'image',
  build: (ctx) => {
    return {
      options: { hotspot: true },
      // preview: {
      //   select: {
      //     title: 'title',
      //     alt: 'alt',
      //     media: 'image',
      //   },
      //   prepare: ({ title, alt, media }: any) => {
      //     return {
      //       // We use our new array-based helper here
      //       // title,
      //       // subtitle: alt,
      //       title: ctx.localizer.value(title) || 'No title',
      //       subtitle: ctx.localizer.value(alt) || 'No alt',
      //       media: 'asdf',
      //     };
      //   },
      // },
    }
  }
}
