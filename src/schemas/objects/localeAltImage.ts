import { ImageIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const localeAltImage: ITSSchemaDefinition = {
  name: 'localeAltImage',
  type: 'image',
  icon: ImageIcon,
  build: (ctx) => {
    return {
      options: { hotspot: true },
      fields: [ctx.f('alt', 'i18nString')],
      validation: (Rule) => Rule.assetRequired(),
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
            title: ctx.localizer.value(alt) || ctx.t.default('localeImage.title'),
            media: asset ? img : ImageIcon,
          }
        },
      },
    }
  },
}
