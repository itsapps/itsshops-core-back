import { ITSSchemaDefinition } from "../../../types";
import { buildShared } from './orderAndOrderMetaFields';
import { StatusIcon } from '../../../components/StatusIcon';

import { TrolleyIcon } from '@sanity/icons'
import { FieldDefinition, isDev } from 'sanity'

export const order: ITSSchemaDefinition = {
  name: 'order',
  type: 'document',
  icon: TrolleyIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate' ],
  allowCreate: isDev,
  build: (ctx) => {
    const { f } = ctx;

    const groups = ['order', 'history' ].map((name, index) => ({
      name, ...index === 0 && { default: true }
    }));

    const fieldsMap: Record<string, FieldDefinition[]> = {
      order: [
        f('orderNumber', 'string', {
          validation: (rule) => rule.required(),
          readOnly: true,
        }),

        f('invoiceNumber', 'string', {
          validation: (rule) => rule.required(),
          readOnly: true,
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
            layout: 'dropdown'
          },
          initialValue: 'created',
          validation: (rule) => rule.required(),
          hidden: true,
        }),
        f('paymentStatus', 'string', {
          options: {
            list: [
              { value: 'succeeded' },
              { value: 'refunded' },
              { value: 'partiallyRefunded' },
            ],
            layout: 'dropdown'
          },
          initialValue: 'succeeded',
          validation: (rule) => rule.required(),
          hidden: true,
        }),
      ],
      history: [
        f('statusHistory', 'array', {
          of: [{ type: 'orderStatusHistory' }],
        }),
      ]
    }

    const fields = groups.map(({ name }) => ([
      ...fieldsMap[name].map(field => ({ ...field, group: name }))
    ])).flat();

    const shared = buildShared(ctx);
    fields.push(...shared.fields);
    groups.push(...shared.groups);

    return {
      groups,
      fields,
      preview: {
        select: {
          // stripeId: 'paymentIntentId',
          total: 'totals.grandTotal',
          status: 'status',
          paymentStatus: 'paymentStatus',
          // created: '_createdAt',
          shipping: 'customer.shippingAddress',
          // locale: language.id
        },
        prepare: ({status, paymentStatus, shipping, total}) => {
          return (status && paymentStatus && shipping && total) ? {
            // title: `${total/100}€ - ${status}`,
            title: `${shipping.name} - ${ctx.format.currency(total/100)}`,
            subtitle: `${shipping.zip} ${shipping.city}, ${shipping.country}`,
            media: StatusIcon({status, paymentStatus}),
          } : {
            title: 'New Order',
            subtitle: 'Create a new order',
            media: StatusIcon({status: 'created', paymentStatus: 'succeeded'}),
          }
        }
      },
    }
  }
};
