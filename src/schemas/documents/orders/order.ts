import { FieldDefinition } from 'sanity'

import { OrderIcon } from '../../../assets/icons'
import { StatusIcon } from '../../../components/StatusIcon'
import { ITSDocumentDefinition } from '../../../types'
import { buildShared } from './orderAndOrderMetaFields'

export const order: ITSDocumentDefinition = {
  name: 'order',
  type: 'document',
  icon: OrderIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  allowCreate: false,
  build: (ctx) => {
    const { f } = ctx
    const groups = ['order', 'history'].map((name) => ({ name }))
    const fieldsMap: Record<string, FieldDefinition[]> = {
      order: [
        f('orderNumber', 'string', {
          validation: (rule) => rule.required(),
          hidden: !ctx.config.isDev,
        }),

        f('invoiceNumber', 'string', {
          validation: (rule) => rule.required(),
          hidden: !ctx.config.isDev,
        }),

        f('status', 'string', {
          options: {
            list: [
              { value: 'created' },
              { value: 'processing' },
              { value: 'shipped' },
              { value: 'delivered' },
              { value: 'canceled' },
              { value: 'returned' },
            ],
            layout: 'dropdown',
          },
          initialValue: 'created',
          validation: (rule) => rule.required(),
          hidden: !ctx.config.isDev,
        }),
        // When the customer placed the order (PaymentIntent `created`), shown in the
        // confirmation mail; the order itself is only created at payment success.
        f('orderDate', 'datetime', {
          readOnly: !ctx.config.isDev,
          options: ctx.format.dateFormat('datetime'),
        }),
        f('paymentStatus', 'string', {
          options: {
            list: [{ value: 'succeeded' }, { value: 'refunded' }, { value: 'partiallyRefunded' }],
            layout: 'dropdown',
          },
          initialValue: 'succeeded',
          validation: (rule) => rule.required(),
          hidden: !ctx.config.isDev,
        }),
      ],
      history: [
        f('statusHistory', 'array', {
          of: [{ type: 'orderStatusHistory' }],
          hidden: !ctx.config.isDev,
        }),
      ],
    }

    const fields = groups
      .map(({ name }) => [...fieldsMap[name].map((field) => ({ ...field, group: name }))])
      .flat()

    const shared = buildShared(ctx)
    shared.fields.push(...fields)
    // Written by the payment webhook (order only — orderMeta is written before the
    // customer's final choice of payment method).
    shared.fields.push({
      ...f('payment', 'orderPaymentMethod', { readOnly: !ctx.config.isDev }),
      group: 'orderPayment',
    })
    shared.groups.push(...groups)

    return {
      ...shared,
      preview: {
        select: {
          // stripeId: 'paymentIntentId',
          orderNumber: 'orderNumber',
          total: 'totals.grandTotal',
          status: 'status',
          paymentStatus: 'paymentStatus',
          // created: '_createdAt',
          shipping: 'customer.shippingAddress',
          // locale: language.id
        },
        prepare: ({ orderNumber, status, paymentStatus, shipping, total }) => {
          return status && paymentStatus && shipping && total
            ? {
                // title: `${total/100}€ - ${status}`,
                // Order number first — the withdrawal order picker searches and shows it.
                title: `${orderNumber ? `#${orderNumber} · ` : ''}${shipping.name} - ${ctx.format.currency(total / 100)}`,
                subtitle: `${shipping.zip} ${shipping.city}, ${shipping.country}`,
                media: StatusIcon({ status, paymentStatus }),
              }
            : {
                title: 'New Order',
                subtitle: 'Create a new order',
                media: StatusIcon({ status: 'created', paymentStatus: 'succeeded' }),
              }
        },
      },
    }
  },
}
