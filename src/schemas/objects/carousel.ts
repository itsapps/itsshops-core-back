import { CarouselIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const carousel: ITSSchemaDefinition = {
  name: 'carousel',
  type: 'object',
  icon: CarouselIcon,
  build: (ctx) => {
    const { f } = ctx
    return {
      options: { collapsible: true, collapsed: false },
      fields: [
        f('slides', 'array', {
          of: [{ type: 'localeAltImage' }],
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
        prepare: ({ slides }) => {
          return {
            // title: 'carousel.title',
            // subtitle: 'carousel.preview.slides',
            // media: "asdf"
            title: ctx.t.default('carousel.preview.slides', `${slides?.length || 0} Slides`, {
              count: slides?.length || 0,
            }),
            subtitle: ctx.t.default('carousel.title'),
            media: CarouselIcon,
          }
        },
      },
    }
  },
}
