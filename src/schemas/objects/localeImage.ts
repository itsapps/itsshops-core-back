import { ImageIcon } from '@phosphor-icons/react'

import { ITSSchemaDefinition } from '../../types'

export const localeImage: ITSSchemaDefinition = {
  name: 'localeImage',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('image', 'i18nCropImage'),
        f('alt', 'i18nString', {
          options: { collapsible: true, collapsed: true },
        }),
      ],
      preview: {
        select: {
          alt: 'alt',
          image: 'image',
        },
        prepare: ({ alt, image }) => {
          return {
            title: ctx.localizer.value(alt) || ctx.t.default('localeImage.title'),
            media: ctx.localizer.value(image) || ImageIcon,
          }
        },
      },
    }
  },
}
