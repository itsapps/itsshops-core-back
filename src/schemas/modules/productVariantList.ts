import { ProductVariantListIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const productVariantList: ITSSchemaDefinition = {
  name: 'productVariantList',
  type: 'object',
  icon: ProductVariantListIcon,
  feature: 'shop',
  build: ({ f, builders }) => {
    return builders.module({
      fields: [f('title', 'i18nString'), builders.variantReferences()],
    })
  },
}
