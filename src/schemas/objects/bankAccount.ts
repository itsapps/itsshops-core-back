import { ITSSchemaDefinition } from '../../types';

export const bankAccount: ITSSchemaDefinition = {
  name: 'bankAccount',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('name', 'string'),
        f('bic', 'string'),
        f('iban', 'string'),
      ]
    }
  }
}