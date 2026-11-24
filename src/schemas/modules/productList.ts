import { ProductListIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const productList: ITSSchemaDefinition = {
  name: 'productList',
  type: 'object',
  icon: ProductListIcon,
  feature: 'shop',
  build: ({ f, builders, t }) => {
    const modules = builders.module({
      fields: [
        f('title', 'i18nString'),
        ...builders.filterField(),
        f('products', 'array', {
          of: [
            {
              type: 'reference',
              title: t.default('product.title'),
              to: [{ type: 'product' }],
              options: { disableNew: true },
            },
          ],
        }),
      ],
    })
    return {
      ...modules,
      preview: {
        select: { title: 'title', filters: 'filters', products: 'products' },
        prepare({ title, filters, products }) {
          const filterCount = filters?.length || 0
          const productCount = products?.length || 0
          const parts: string[] = []
          if (filterCount) {
            parts.push(
              t.default('productList.preview.filters', `${filterCount} Filters`, {
                count: filterCount,
              }),
            )
          }
          if (productCount) {
            parts.push(
              t.default('productList.preview.products', `${productCount} Products`, {
                count: productCount,
              }),
            )
          }
          return {
            title: t.default('productList.title', title),
            subtitle:
              parts.join(' · ') ||
              t.default('productList.preview.filters', '0 Filters', { count: 0 }),
            media: ProductListIcon,
          }
        },
      },
    }
  },
}
