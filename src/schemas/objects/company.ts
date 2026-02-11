import { ITSSchemaDefinition } from '../../types';

export const company: ITSSchemaDefinition = {
  name: 'company',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('name', 'i18nString'),
        f('owner', 'string'),
        f('address', 'address'),
      ]
    }
  }
}