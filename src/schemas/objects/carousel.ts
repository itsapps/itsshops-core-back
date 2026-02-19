import { ITSSchemaDefinition } from '../../types';

import {PackageIcon} from '@sanity/icons'

export const carousel: ITSSchemaDefinition = {
  name: 'carousel',
  type: 'object',
  icon: PackageIcon,
  build: (ctx) => {
    const { f } = ctx;
    return {
      options: { collapsible: true, collapsed: false },
      fields: [
        f('slides', 'array', { 
          of: [ { type: "localeImage" } ],
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
        prepare: ({slides}) => {
          return {
            // title: 'carousel.title',
            // subtitle: 'carousel.preview.slides',
            // media: "asdf"
            title: ctx.t.default('carousel.title'),
            subtitle: ctx.t.default('carousel.preview.slides', undefined, { count: slides?.length || 0 }),
            media: PackageIcon,
          }
        }
      }
    }
  },
};