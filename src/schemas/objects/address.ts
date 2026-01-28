// packages/core-back/src/schemas/objects/multiColumns.ts
import { CoreObject, FieldContext } from '../../types';
import { countryOptions, defaultCountry } from '../../utils/constants';

export const address: CoreObject = {
  name: 'address',
  type: 'object',
  build: (ctx: FieldContext) => {
    const { f } = ctx;
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
            list: countryOptions.map(country => ({ title: `${country.value} (${ctx.helpers.localizer.dictValue(country.title)})`, value: country.value }))
          },
          initialValue: defaultCountry.value,
          validation: (Rule) => Rule.required()
        }),
        f('state', 'string'),
      ],
    };
  }
};