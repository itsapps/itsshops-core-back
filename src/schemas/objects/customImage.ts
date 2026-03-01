import { ImageIcon } from '@phosphor-icons/react'

import { ITSSchemaDefinition } from '../../types'

export const customImage: ITSSchemaDefinition = {
  name: 'customImage',
  type: 'object',
  icon: ImageIcon,
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [f('image', 'image', { options: { hotspot: true } }), f('alt', 'string')],
      preview: {
        select: {
          image: 'image',
          alt: 'alt',
        },
        prepare: ({ image, alt }) => {
          return {
            title: alt || ctx.t.default('customImage.title'),
            media: image || ImageIcon,
          }
        },
      },
    }
  },
}
