import type { FieldContext } from "../../../types";

import { FieldDefinition, isDev } from 'sanity'


export const buildShared = (ctx: FieldContext) => {
    const { f } = ctx;

    const groups = ['orderPayment', 'orderItems', 'orderCustomer', 'orderTotals', 'orderVouchers', 'orderFreeProducts' ].map((name, index) => ({
      name
    }));

    const fieldsMap: Record<string, FieldDefinition[]> = {
      orderPayment: [
        f('paymentIntentId', 'string', {
          validation: (rule) => rule.required(),
          readOnly: true
        }),
      ],
      orderItems: [
        f('orderItems', 'array', {
          of: [ { type: 'orderItem' } ],
          validation: (rule) => rule.required(),
          options: {
            ...!isDev && {disableActions: ['add', 'duplicate', 'addBefore', 'addAfter', 'copy', 'remove']},
            sortable: false,
          },
        }),
      ],
      orderCustomer: [
        f('customer', 'orderCustomer', {
          validation: (rule) => rule.required(),
        }),
      ],
      orderTotals: [
        f('totals', 'orderTotals', {
          validation: (rule) => rule.required(),
          readOnly: true
        }),
      ],
      orderVouchers: [
        // f('vouchers', 'array', {
        //   of: [ { type: 'orderVoucher' } ],
        //   validation: (rule) => rule.required(),
        // }),
      ],
      orderFreeProducts: [
        // f('freeProducts', 'array', {
        //   of: [ { type: 'orderFreeProduct' } ],
        //   validation: (rule) => rule.required(),
        // }),
      ],
    }

    const fields = groups.map(({ name }) => ([
      ...fieldsMap[name].map(field => ({ ...field, group: name }))
    ])).flat();

    return {
      groups,
      fields,
    }
  }
