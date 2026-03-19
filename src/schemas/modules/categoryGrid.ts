import { CategoryGridIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const categoryGrid: ITSSchemaDefinition = {
  name: 'categoryGrid',
  type: 'object',
  icon: CategoryGridIcon,
  feature: 'shop.category',
  build: ({ f, builders }) => {
    return builders.module({
      fields: [
        f('title', 'i18nString'),
        f('categories', 'array', {
          of: [{ type: 'reference', to: [{ type: 'category' }], options: { disableNew: true } }],
        }),
      ],
    })
  },
}
