import { ITSObject, FieldContext } from '../../types';

import {PackageIcon} from '@sanity/icons'

export const test: ITSObject = {
  name: 'test',
  fields: (ctx: FieldContext) => {
    const { f } = ctx;
    return [
      f('autoplay', 'boolean', { initialValue: false }),
    ]
    // return {
    //   type: 'object',
    //   // icon: PackageIcon,
    //   fields: [
    //     f('slides', 'array', { 
    //       of: [ { type: "localeImage" } ],
    //     }),
    //     f('autoplay', 'boolean', { initialValue: false }),
    //     f('autoplayDelay', 'number', { initialValue: 5 }),
    //     f('loop', 'boolean', { initialValue: false }),
    //     f('fade', 'boolean', { initialValue: false }),
    //   ],
    //   preview: {
    //     select: {
    //       slides: 'slides',
    //     },
    //     prepare: ({slides}: any) => {
    //       return {
    //         // title: 'carousel.title',
    //         // subtitle: 'carousel.preview.slides',
    //         // media: "asdf"
    //         title: ctx.t.default('carousel.title'),
    //         subtitle: ctx.t.default('carousel.preview.slides', undefined, { count: slides?.length || 0 }),
    //         media: PackageIcon,
    //       }
    //     }
    //   }
    // };
  }
};