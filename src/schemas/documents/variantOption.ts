import { OptionIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const variantOption: ITSDocumentDefinition = {
  name: 'variantOption',
  type: 'document',
  icon: OptionIcon,
  feature: 'shop.productKind.options',
  disallowedActions: ['duplicate'],
  allowCreate: false,
  hideInStructure: true,
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('group', 'reference', {
          to: [{ type: 'variantOptionGroup' }],
          readOnly: !ctx.config.isDev,
          validation: (rule) => rule.required(),
        }),
        f('sortOrder', 'number', {
          initialValue: 0,
          validation: (rule) => rule.required().positive(),
        }),
      ],
      preview: {
        select: {
          title: 'title',
          groupTitle: 'group.title',
        },
        prepare({ title, groupTitle }) {
          // const image = ctx.localizer.value<any>(media)
          return {
            title: ctx.localizer.value(title),
            subtitle: ctx.localizer.value(groupTitle),
            media: OptionIcon,
            // media: image?.asset,
          }
        },
      },
    }
  },
}
