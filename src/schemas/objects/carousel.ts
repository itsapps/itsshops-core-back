// packages/core-back/src/schemas/objects/multiColumns.ts
import { CoreObject, FieldContext } from '../../types';

export const carousel: CoreObject = {
  name: 'carousel',
  type: 'object',
  build: (ctx: FieldContext) => {
    const { f } = ctx;
    return {
      fields: [
        f('slides', 'array', { 
          of: [ { type: "localeImage" } ],
          // options: {
          //   layout: 'grid'
          // }
        }),
        f('autoplay', 'boolean', { initialValue: false }),
        f('autoplayDelay', 'number', { initialValue: 5 }),
        f('loop', 'boolean', { initialValue: false }),
        f('fade', 'boolean', { initialValue: false }),
      ],
      preview: {
        select: {
          slides: 'slides',
        },
        prepare: ({slides}: any) => {
          return {
            title: ctx.helpers.t.default('carousel.title'),
            subtitle: ctx.helpers.t.default('carousel.preview.slides', undefined, { count: slides?.length || 0 }),
            // subtitle: `${slides?.length || 0} ${ctx.t('carousel.preview.slides')}`,
          }
        }
      }
    };
  }
};