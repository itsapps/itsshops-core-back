import { CoreObject, FieldContext } from '../../types';

export const titleImage: CoreObject = {
  name: 'titleImage',
  build: (ctx: FieldContext) => {
    return {
      type: 'image',
      options: { hotspot: true },
      fields: [
        ctx.f('title', 'string'),
        ctx.f('alt', 'string'),
      ],
    }
  }
}
