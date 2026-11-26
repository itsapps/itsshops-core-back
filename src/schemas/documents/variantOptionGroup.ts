import { OptionGroupIcon } from '../../assets/icons'
import { createOptionGroupPreviewMedia } from '../../components/products/OptionGroupPreview'
import { ITSDocumentDefinition } from '../../types'

export const variantOptionGroup: ITSDocumentDefinition = {
  name: 'variantOptionGroup',
  type: 'document',
  icon: OptionGroupIcon,
  feature: 'shop.productKind.options',
  disallowedActions: ['duplicate'],
  build: (ctx) => {
    const { f } = ctx
    const optionGroupMedia = createOptionGroupPreviewMedia(ctx)
    return {
      orderings: [
        {
          title: ctx.t.default('orderings.sortOrder', 'Order'),
          name: 'sortOrderAsc',
          by: [
            { field: 'sortOrder', direction: 'asc' },
            { field: '_createdAt', direction: 'asc' },
          ],
        },
        {
          title: ctx.t.default('orderings.titleAsc', 'Title (A–Z)'),
          name: 'titleAsc',
          by: [{ field: 'title[0].value', direction: 'asc' }],
        },
      ],
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        // f('description', 'i18nString'),
        f('displayMode', 'string', {
          options: {
            list: [{ value: 'dropdown' }, { value: 'list' }],
            layout: 'radio',
            direction: 'horizontal',
          },
          initialValue: 'dropdown',
        }),
        f('sortOrder', 'number', {
          initialValue: 0,
          validation: (rule) => rule.required().positive(),
        }),
      ],
      preview: {
        select: {
          id: '_id',
          title: 'title',
        },
        prepare({ id, title }) {
          const groupId = typeof id === 'string' ? id.replace(/^drafts\./, '') : undefined
          return {
            title: ctx.localizer.value(title),
            // Live option count + draft dot over the icon (see OptionGroupPreview.tsx).
            media: groupId ? optionGroupMedia(groupId, OptionGroupIcon) : OptionGroupIcon,
          }
        },
      },
    }
  },
}
