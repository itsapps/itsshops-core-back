import { ProductGridIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const productGrid: ITSSchemaDefinition = {
  name: 'productGrid',
  type: 'object',
  icon: ProductGridIcon,
  feature: 'shop',
  build: ({ f, builders }) => {
    return builders.module({
      fields: [f('title', 'i18nString'), builders.variantReference({ multiple: true })],
    })
  },
}
