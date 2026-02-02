import { ITSObject2, FieldContext } from '../../types';

import {PackageIcon} from '@sanity/icons'

export const test2: ITSObject2 = {
  name: 'test2',
  icon: "blabla",
  fields: (ctx) => {
    const { f } = ctx;
    return [
      f('autoplay', 'boolean', { initialValue: false }),
    ]
  },
  preview: (ctx) => {
    return {
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
          media: "PackageIcon",
        }
      }
    }
  }
};