import { OrderWithdrawalIcon as Icon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

/**
 * Marks where the generated withdrawal instructions + model form render (core-front builds them
 * from shopSettings + settings.company — the same source as the order confirmation mail).
 * No content fields: page-only extras go into ordinary modules above/below it.
 */
export const withdrawalPolicyModule: ITSSchemaDefinition = {
  name: 'withdrawalPolicyModule',
  type: 'object',
  icon: Icon,
  feature: 'shop',
  build: (ctx) => {
    return {
      ...ctx.builders.module({ fields: [] }),
      preview: {
        prepare: () => ({ title: ctx.t.default('withdrawalPolicyModule.title'), media: Icon }),
      },
    }
  },
}
