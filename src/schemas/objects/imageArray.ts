import { ITSSchemaDefinition } from '../../types';


export const imageArray: ITSSchemaDefinition = {
  name: 'imageArray',
  type: 'array',
  // type: 'image',
  build: (ctx) => {
    const bla = {
      type: 'array',
      title: "leck",
      of: [
        { type: 'baseImage' },
        // {
        //   type: 'reference',
        //   title: 'ref zu bildli',
        //   to: [
        //     { type: 'productVariant' },
        //     { type: 'page' },
        //   ],
        //     options: { filter: `
        //       (!defined(active) && _type != "productVariant") ||
        //       (active == true && _type == "productVariant")
        //     ` },
        // },
      ],
      // fields: [
      //   ctx.f('title', 'string'),
      //   ctx.f('alt', 'string'),
      // ],
    }
    return bla
  }
}
