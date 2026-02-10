import { TrolleyIcon } from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";
import { getStateTranslationKey } from '../../utils/orders';

export const order: ITSSchemaDefinition = {
  name: 'order',
  type: 'document',
  icon: TrolleyIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate' ],
  allowCreate: true,
  build: (ctx) => {
    const { f } = ctx;
    return {
      groups: [
        { name: 'order', default: true, },
        { name: 'customer', },
        { name: 'totals', },
        { name: 'vouchers', },
      ],
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        // f('trackingNumber', 'string', { group: 'order', }),
        // f('orderNumber', 'string', {
        //   validation: (rule) => rule.required(),
        //   hidden: true,
        //   group: 'order',
        // }),
        // f('invoiceNumber', 'string', {
        //   validation: (rule) => rule.required(),
        //   hidden: true,
        //   group: 'order',
        // }),
        // f('status', 'string', {
        //   options: {
        //     list: [
        //       { title: ctx.t.default(getStateTranslationKey('created')), value: 'created' },
        //       { title: ctx.t.default(getStateTranslationKey('processing')), value: 'processing' },
        //       { title: ctx.t.default(getStateTranslationKey('shipped')), value: 'shipped' },
        //       { title: ctx.t.default(getStateTranslationKey('delivered')), value: 'delivered' },
        //       { title: ctx.t.default(getStateTranslationKey('canceled')), value: 'canceled' },
        //       { title: ctx.t.default(getStateTranslationKey('returned')), value: 'returned' },
        //     ],
        //     layout: 'dropdown'
        //   },
        //   initialValue: 'created',
        //   validation: (rule) => rule.required(),
        //   hidden: true,
        //   group: 'order',
        // }),
        // f('paymentStatus', 'string', {
        //   options: {
        //     list: [
        //       { title: ctx.t.default(getStateTranslationKey('succeeded')), value: 'succeeded' },
        //       { title: ctx.t.default(getStateTranslationKey('refunded')), value: 'refunded' },
        //       { title: ctx.t.default(getStateTranslationKey('partiallyRefunded')), value: 'partiallyRefunded' },
        //     ],
        //     layout: 'dropdown'
        //   },
        //   initialValue: 'succeeded',
        //   validation: (rule) => rule.required(),
        //   hidden: true,
        //   group: 'order',
        // }),
        // f('statusHistory', 'array', {
        //   group: 'order',
        //   hidden: true,
        //   of: [
        //     {
        //       type: 'object',
        //       fields: [
        //         {
        //           name: 'type',
        //           title: ctx.t.default('order.statusHistory.type.title'),
        //           type: 'string',
        //           options: {
        //             list: [
        //               {title: ctx.t.default('order.statusHistory.type.options.payment'), value: 'payment'},
        //               {title: ctx.t.default('order.statusHistory.type.options.fulfillment'), value: 'fulfillment'},
        //             ],
        //           },
        //           validation: (rule) => rule.required(),
        //         },
        //         {
        //           name: 'state',
        //           title: t('order.statusHistory.state.title'),
        //           type: 'string',
        //           validation: (rule) => rule.required(),
        //         },
        //         {
        //           name: 'timestamp',
        //           title: t('order.statusHistory.timestamp.title'),
        //           type: 'datetime',
        //           initialValue: () => new Date().toISOString(),
        //           validation: (rule) => rule.required(),
        //         },
        //         {
        //           name: 'source',
        //           title: t('order.statusHistory.source.title'),
        //           type: 'string',
        //         },
        //         {
        //           name: 'note',
        //           title: t('order.statusHistory.note.title'),
        //           type: 'text',
        //           rows: 2,
        //         },
        //       ],
        //       preview: {
        //         select: {
        //           state: 'state',
        //           type: 'type',
        //           timestamp: 'timestamp',
        //           source: 'source',
        //           note: 'note',
        //         },
        //         prepare(selection) {
        //           const { state, type, timestamp, source, note } = selection
        //           const subtitle = [source || '', note || ''].filter(Boolean).join(' - ')
        //           return {
        //             title: `${localizeDate(timestamp, language.id, 'medium', 'medium')}: ${t(`order.statusHistory.type.options.${type}`)} - ${t(getStateTranslationKey(state))}`,
        //             subtitle,
        //           }
        //         },
        //       }
        //     },
        //   ],
        // }),
        // f('shipping', 'shipping', {
        //   validation: (rule) => rule.required(),
        //   group: 'customer',
        // }),
      ],
      // preview: {
      //   select: {
      //     title: 'title',
      //     subtitle: 'parent.title',
      //     media: 'image',
      //   },
      //   prepare(s: any) {
      //     const { title, subtitle, media } = s
      //     const sub = ctx.getLocalizedValue(subtitle)
      //     return {
      //       title: ctx.getLocalizedValue(title),
      //       subtitle: sub ? `– ${sub}` : ``,
      //       media: media,
      //     }
      //   }
      // }
    }
  }
};
