// packages/core-back/src/schemas/objects/multiColumns.ts
import { ITSSchemaDefinition } from '../../types';

export const address: ITSSchemaDefinition = {
  name: 'address',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx;

    return {
      fields: [
        f('prename', 'string'),
        f('lastname', 'string'),
        f('phone', 'string'),
        f('line1', 'string'),
        f('line2', 'string'),
        f('zip', 'string'),
        f('city', 'i18nString'),
        f('country', 'string', {
          options: {
            list: ctx.countryOptions
          },
        }),
        f('state', 'string'),
      ],
    }
  }
};