import { ProductListIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const productList: ITSSchemaDefinition = {
  name: 'productList',
  type: 'object',
  icon: ProductListIcon,
  feature: 'shop',
  build: ({ f, builders, t }) => {
    const modules = builders.module({
      fields: [f('title', 'i18nString'), ...builders.filterField()],
    })
    return {
      ...modules,
      preview: {
        select: { title: 'title', filters: 'filters' },
        prepare({ title, filters }) {
          return {
            title: t.default('productList.title', title),
            subtitle: t.default('productList.preview.filters', `${filters?.length || 0} Filters`, {
              count: filters?.length || 0,
            }),
            media: ProductListIcon,
          }
        },
      },
    }
  },
}
