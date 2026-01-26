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
        }),
        f('autoplay', 'boolean', { initialValue: false }),
        f('autoplayDelay', 'number', { initialValue: 5 }),
        f('loop', 'boolean', { initialValue: false }),
        f('fade', 'boolean', { initialValue: false }),
        f('start', 'string'),
        f('url', 'string', { validation: (Rule) => Rule.required() }),
      ],
      preview: {
        select: {
          slides: 'slides',
        },
        prepare: ({slides}: any) => {
          return {
            title: ctx.t('carousel.schemaTitle'),
            subtitle: `${slides?.length || 0} ${ctx.t('carousel.preview.slides')}`,
          }
        }
      }
    };
  }
};