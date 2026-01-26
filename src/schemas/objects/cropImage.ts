import { CoreObject, FieldContext } from '../../types';

export const cropImage: CoreObject = {
  name: 'cropImage',
  type: 'image',
  build: (ctx: FieldContext) => {
    return {
      options: { hotspot: true },
      // fields: [
      //   ctx.f('title', 'string'),
      //   ctx.f('alt', 'string'),
      // ],
    }
  }
}
