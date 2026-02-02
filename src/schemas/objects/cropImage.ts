import { CoreObject, FieldContext } from '../../types';

import {
  ImageDefinition
} from 'sanity';

export const cropImage: CoreObject = {
  name: 'cropImage',
  // type: 'image',
  build: (ctx: FieldContext) => {
    return {
      type: 'image',
      options: { hotspot: true },
      // fields: [
      //   ctx.f('title', 'string'),
      //   ctx.f('alt', 'string'),
      // ],
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
            media: 'asdf',
          };
        },
      },
    }
  }
}
