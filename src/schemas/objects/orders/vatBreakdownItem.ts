import { CalculatorIcon } from '@phosphor-icons/react'

import { ITSSchemaDefinition } from '../../../types'

export const vatBreakdownItem: ITSSchemaDefinition = {
  name: 'vatBreakdownItem',
  type: 'object',
  feature: 'shop',
  icon: CalculatorIcon,
  build: (ctx) => {
    const { f } = ctx

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
    }
  },
}
