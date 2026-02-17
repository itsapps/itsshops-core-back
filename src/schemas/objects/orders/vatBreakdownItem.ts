import { ITSSchemaDefinition } from '../../../types';
import { Calculator } from 'phosphor-react';

export const vatBreakdownItem: ITSSchemaDefinition = {
  name: 'vatBreakdownItem',
  type: 'object',
  feature: 'shop',
  icon: Calculator,
  build: (ctx) => {
    const { f } = ctx;

    return {
      fields: [
        f('rate', 'number', {
          title: 'Rate %',
        }),
        f('net', 'number', {
          title: 'Net Amount',
        }),
        f('vat', 'number', {
          title: 'Vat Amount',
        }),
        f('label', 'i18nString', {
          title: 'Label (e.g., "VAT 20%")',
        }),
      ],
    };
  }
};