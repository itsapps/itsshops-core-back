import { CategoryListIcon as Icon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const categoryList: ITSSchemaDefinition = {
  name: 'categoryList',
  type: 'object',
  icon: Icon,
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
            title: ctx.localizer.value(title) || t.default('categoryList.title'),
            subtitle: ctx.t.default('categoryList.preview.categories', `${count} Categories`, {
              count,
            }),
            media: Icon,
          }
        },
      },
    }
  },
}
