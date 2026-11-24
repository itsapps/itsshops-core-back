import { CustomerIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const customerGroup: ITSDocumentDefinition = {
  name: 'customerGroup',
  type: 'document',
  icon: CustomerIcon,
  feature: 'users',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [f('title', 'i18nString', { i18n: 'atLeastOne' })],
      preview: {
        select: {
          title: 'title',
        },
        prepare({ title }) {
          return {
            title: ctx.localizer.value(title) || 'No title',
            // subtitle: sub ? `– ${sub}` : ``,
            // media: media,
          }
        },
      },
    }
  },
}
