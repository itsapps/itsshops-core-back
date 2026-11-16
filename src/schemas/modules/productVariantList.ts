import { ProductVariantListIcon as Icon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const productVariantList: ITSSchemaDefinition = {
  name: 'productVariantList',
  type: 'object',
  icon: Icon,
  feature: 'shop',
  build: (ctx) => {
    const { f, builders, t } = ctx
    const modules = builders.module({
      fields: [f('title', 'i18nString'), builders.variantReferences()],
    })
    return {
      ...modules,
      preview: {
        select: { title: 'title', products: 'products' },
        prepare({ title, products }) {
          const count = products?.length || 0
          return {
            title: ctx.localizer.value(title) || t.default('productVariantList.title'),
            subtitle: t.default('productVariantList.preview.products', `${count} Variants`, {
              count,
            }),
            media: Icon,
          }
        },
      },
    }
  },
}
