import { CategoryIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const category: ITSDocumentDefinition = {
  name: 'category',
  type: 'document',
  icon: CategoryIcon,
  feature: 'shop.category',
  disallowedActions: ['delete'],
  build: (ctx) => {
    const {
      f,
      builders,
      config: { apiVersion },
    } = ctx

    const groupedData = ctx.builders.buildGroupedSchema([
      {
        name: 'infos',
        fields: [
          f('title', 'i18nString', { i18n: 'atLeastOne' }),
          f('description', 'i18nString'),
          f('level', 'number', { hidden: true }),
          f('sortOrder', 'number', {
            initialValue: 0,
            validation: (rule) => rule.required().positive(),
          }),
          f('parent', 'reference', {
            to: [{ type: 'category' }],
            options: { disableNew: true },
            validation: (rule) =>
              rule.custom((parent, context) => {
                // parent = the selected parent ref
                // context.document = the category being edited

                // If parent is empty → this is a main category → always allowed
                if (!parent) return true

                // Count how many categories have no parent
                return context
                  .getClient({ apiVersion })
                  .fetch('count(*[_type == "category" && !defined(parent) && _id != $id])', {
                    id: context.document?._id,
                  })
                  .then((mainCount) => {
                    if (mainCount === 0) {
                      return 'At least one category must remain a main category (without a parent).'
                    }
                    return true
                  })
              }),
          }),
        ],
      },
      {
        name: 'filters',
        fields: [...builders.filterField()],
      },
      {
        name: 'seo',
        fields: [f('seo', 'seo')],
      },
    ])

    return {
      ...groupedData,
      preview: {
        select: {
          title: 'title',
          subtitle: 'parent.title',
        },
        prepare({ title, subtitle }) {
          const sub = ctx.localizer.value(subtitle)
          return {
            title: ctx.localizer.value(title),
            subtitle: sub ? `– ${sub}` : ``,
            media: CategoryIcon,
          }
        },
      },
    }
  },
}
