import { OrderWithdrawalIcon as Icon } from '../../../assets/icons'
import { ITSDocumentDefinition } from '../../../types'

/**
 * A consumer's right-of-withdrawal ("Widerruf") declaration against an order.
 *
 * Created by the public `/api/order/withdraw` endpoint (or manually, e.g. for a
 * withdrawal received by phone/letter). Declaration-only — the merchant processes
 * the return + refund through the normal order flow; this is the durable,
 * timestamped record and worklist.
 */
export const orderWithdrawal: ITSDocumentDefinition = {
  name: 'orderWithdrawal',
  type: 'document',
  icon: Icon,
  feature: 'shop',
  // Created only by the web endpoint or the "Declare withdrawal" order action —
  // never via a blank create form (which can't set the readOnly orderRef).
  allowCreate: false,
  // A withdrawal is a legal record (proof the consumer declared in time) — never
  // delete it; mark ineligible/bogus ones `rejected` instead. (Dev mode still
  // allows delete via the actionResolver isDev bypass.)
  disallowedActions: ['delete', 'duplicate'],
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('orderRef', 'reference', {
          to: [{ type: 'order' }],
          readOnly: true,
          validation: (rule) => rule.required(),
        }),
        f('declaredAt', 'datetime', {
          readOnly: !ctx.config.isDev,
          options: ctx.format.dateFormat('datetime'),
          validation: (rule) => rule.required(),
        }),
        f('status', 'string', {
          options: {
            list: [
              { value: 'received' },
              { value: 'processing' },
              { value: 'refunded' },
              { value: 'rejected' },
            ],
            layout: 'dropdown',
          },
          initialValue: 'received',
          validation: (rule) => rule.required(),
        }),
        f('reason', 'text', { rows: 3 }),
        f('note', 'text', { rows: 2 }),
      ],
      preview: {
        select: {
          orderNumber: 'orderRef.orderNumber',
          status: 'status',
          declaredAt: 'declaredAt',
        },
        prepare: ({ orderNumber, status, declaredAt }) => ({
          title: ctx.t
            .default('orderWithdrawal.preview.title', 'Withdrawal #{{orderNumber}}', {
              orderNumber: orderNumber ?? '',
            })
            .trim(),
          subtitle: [
            declaredAt ? ctx.format.date(declaredAt, { dateStyle: 'medium' }) : null,
            status
              ? ctx.t.default(`orderWithdrawal.fields.status.options.${status}`, status)
              : null,
          ]
            .filter(Boolean)
            .join(' · '),
        }),
      },
    }
  },
}
