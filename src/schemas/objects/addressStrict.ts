import { ITSSchemaDefinition } from '../../types'

export const addressStrict: ITSSchemaDefinition = {
  name: 'addressStrict',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx

    return {
      fields: [
        f('name', 'string', { validation: (Rule) => Rule.required() }),
        f('prename', 'string'),
        f('lastname', 'string'),
        f('line1', 'string', { validation: (Rule) => Rule.required() }),
        f('line2', 'string'),
        f('zip', 'string', { validation: (Rule) => Rule.required() }),
        f('city', 'string', { validation: (Rule) => Rule.required() }),
        f('country', 'string', {
          options: {
            // Every ISO country: a pickup order's billing address may come from anywhere
            // (shipping addresses are limited to tax countries by the checkout anyway).
            list: ctx.constants.allCountryOptions,
          },
          validation: (Rule) => Rule.required(),
        }),
        f('state', 'string'),
        f('phone', 'string'),
      ],
    }
  },
}
