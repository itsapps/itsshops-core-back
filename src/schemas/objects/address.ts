// packages/core-back/src/schemas/objects/multiColumns.ts
import { ITSSchemaDefinition } from '../../types';

export const address: ITSSchemaDefinition = {
  name: 'address',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f, config } = ctx;

    return {
      fields: [
        f('name', 'string', { validation: (Rule) => Rule.required() }),
        f('prename', 'string', { validation: (Rule) => Rule.required() }),
        f('lastname', 'string', { validation: (Rule) => Rule.required() }),
        f('phone', 'string'),
        f('line1', 'string', { validation: (Rule) => Rule.required() }),
        f('line2', 'string'),
        f('zip', 'string', { validation: (Rule) => Rule.required() }),
        f('city', 'string', { validation: (Rule) => Rule.required() }),
        f('country', 'string', {
          options: {
            list: ctx.countryOptions
          },
          validation: (Rule) => Rule.required()
        }),
        f('state', 'string'),
      ],
    }
  }
};