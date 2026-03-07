import { OptionGroupIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const variantOptionGroup: ITSDocumentDefinition = {
  name: 'variantOptionGroup',
  type: 'document',
  icon: OptionGroupIcon,
  feature: 'shop.productKind.options',
  disallowedActions: ['duplicate'],
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        // f('description', 'i18nString'),
        f('sortOrder', 'number', {
          initialValue: 0,
          validation: (rule) => rule.required().positive(),
        }),
      ],
      preview: {
        select: {
          title: 'title',
        },
        prepare({ title }) {
          return {
            title: ctx.localizer.value(title),
            media: OptionGroupIcon,
          }
        },
      },
    }
  },
}
