import { ITSSchemaDefinition } from '../../types'

export const company: ITSSchemaDefinition = {
  name: 'company',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('name', 'i18nString'),
        f('owner', 'string'),
        f('address', 'businessAddress'),
        f('email', 'string'),
        f('phone', 'string'),
        f('vatId', 'string'),
        // Firmenbuch — optional (sole-trader farms often aren't registered); rendered only when set.
        f('registerNumber', 'string'),
        f('registerCourt', 'string'),
      ],
    }
  },
}
