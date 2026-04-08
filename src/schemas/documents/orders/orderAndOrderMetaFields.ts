import { FieldDefinition } from 'sanity'

import type { FieldContext } from '../../../types'

export const buildShared = (ctx: FieldContext) => {
  const { f } = ctx

  const groups = [
    'fulfillment',
    'orderCustomer',
    'orderPayment',
    'orderTotals',
    'orderItems',
    'orderVouchers',
    'orderFreeProducts',
  ].map((name, index) => ({
    name,
    ...(index === 0 && { default: true }),
  }))

  const fieldsMap: Record<string, FieldDefinition[]> = {
    fulfillment: [
      f('fulfillment', 'fulfillment', {
        validation: (rule) => rule.required(),
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
        hidden: !ctx.config.isDev,
      }),
    ],
    orderPayment: [
      f('paymentIntentId', 'string', {
        validation: (rule) => rule.required(),
        hidden: !ctx.config.isDev,
      }),
    ],
    orderItems: [
      f('orderItems', 'array', {
        of: [{ type: 'orderItem' }],
        validation: (rule) => rule.required(),
        options: {
          ...(!ctx.config.isDev && {
            disableActions: ['add', 'duplicate', 'addBefore', 'addAfter', 'copy', 'remove'],
          }),
          sortable: false,
        },
        hidden: !ctx.config.isDev,
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

  const fields = groups
    .map(({ name }) => [...fieldsMap[name].map((field) => ({ ...field, group: name }))])
    .flat()

  return {
    groups,
    fields,
  }
}
