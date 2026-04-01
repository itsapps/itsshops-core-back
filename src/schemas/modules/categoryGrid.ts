import { CategoryGridIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const categoryGrid: ITSSchemaDefinition = {
  name: 'categoryGrid',
  type: 'object',
  icon: CategoryGridIcon,
  feature: 'shop.category',
  build: (ctx) => {
    const { f, builders, t } = ctx
    const modules = builders.module({
      fields: [
        f('title', 'i18nString'),
        f('categories', 'array', {
          of: [
            {
              type: 'reference',
              title: t.default('category.title'),
              to: [{ type: 'category' }],
              options: { disableNew: true },
              validation: (Rule) => Rule.required(),
            },
          ],
        }),
      ],
    })
    return {
      ...modules,
      preview: {
        select: { title: 'title', categories: 'categories' },
        prepare({ title, categories }) {
          const count = categories?.length || 0
          return {
            title: ctx.localizer.value(title) || t.default('categoryGrid.title'),
            subtitle: ctx.t.default('categoryGrid.preview.categories', `${count} Categories`, {
              count,
            }),
            media: CategoryGridIcon,
          }
        },
      },
    }
  },
}
