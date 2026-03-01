import { ImageIcon } from '@phosphor-icons/react'

import { ITSImageDefinition } from '../../types'

export const baseImage: ITSImageDefinition = {
  name: 'baseImage',
  type: 'image',
  icon: ImageIcon,
  build: (ctx) => {
    return {
      options: { hotspot: true },
      fields: [ctx.f('alt', 'string')],
      validation: (Rule) => Rule.required().assetRequired(),
      // validation: (rule) =>
      //   rule.custom((field) => {
      //     const image = field as { asset?: unknown };
      //     return image?.asset
      //       ? true
      //       : ctx.t.default('localeImage.validation.assetRequired')
      //       // : {
      //       //     message: ctx.t.default('localeImage.validation.assetRequired'),
      //       //     // path: []
      //       // };
      //   }),
      preview: {
        select: {
          alt: 'alt',
          asset: 'asset',
          crop: 'crop',
          hotspot: 'hotspot',
        },
        prepare: ({ alt, asset, crop, hotspot }) => {
          const img = { asset, crop, hotspot } as any
          return {
            // We use our new array-based helper here
            title: alt,
            // title: ctx.localizer.value(title) || 'No title',
            // subtitle: ctx.localizer.value(alt) || 'No alt',
            media: asset ? img : ImageIcon,
          }
        },
      },
    }
  },
}
