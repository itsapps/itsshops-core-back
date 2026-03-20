import { ITSSchemaDefinition } from '../../types'

export const businessAddress: ITSSchemaDefinition = {
  name: 'businessAddress',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('line1', 'string'),
        f('line2', 'string'),
        f('zip', 'string'),
        f('city', 'i18nString'),
        f('country', 'string', {
          options: {
            list: ctx.constants.countryOptions,
          },
        }),
      ],
    }
  },
}
