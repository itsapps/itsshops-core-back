import { CoreObject, FieldContext } from '../../types';

export const titleImage: CoreObject = {
  name: 'titleImage',
  type: 'image',
  build: (ctx: FieldContext) => {
    return {
      options: { hotspot: true },
      fields: [
        ctx.f('title', 'string'),
        ctx.f('alt', 'string'),
      ],
    }
  }
}
