import { ManufacturerIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const manufacturer: ITSDocumentDefinition = {
  name: 'manufacturer',
  type: 'document',
  icon: ManufacturerIcon,
  feature: 'shop.manufacturer',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('name', 'i18nString', { i18n: 'atLeastOne' }),
        f('description', 'i18nText'),
        f('link', 'url'),
      ],
      preview: {
        select: {
          name: 'name',
        },
        prepare({ name }) {
          return {
            title: ctx.localizer.value(name),
            media: ManufacturerIcon,
          }
        },
      },
    }
  },
}
