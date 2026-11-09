import { OrderWithdrawalIcon as Icon } from '../../../assets/icons'
import { WithdrawalGuideInput } from '../../../components/WithdrawalGuideInput'
import { WithdrawalStatusInput } from '../../../components/WithdrawalStatusInput'
import { ITSDocumentDefinition } from '../../../types'

/**
 * A consumer's right-of-withdrawal ("Widerruf") declaration against an order.
 *
 * Created by the public `/api/order/withdraw` endpoint (or manually, e.g. for a
 * withdrawal received by phone/letter). Declaration-only — the merchant processes
 * the return + refund through the normal order flow; this is the durable,
 * timestamped record and worklist.
 *
 * A web declaration that matches no order (or whose email differs from the order's)
 * is stored as `unmatched` without an order — a declaration is never lost. Editors
 * assign it with "Assign order" (sets `received` + `assignedAt`; "Unassign" undoes a wrong
 * pick) or delete it after checking. Matched records are never deleted (proof that a
 * declaration was received); mark ineligible ones `rejected` instead. Delete is re-added as a
 * guarded action in `config/actions.ts` (unmatched only).
 */
export const orderWithdrawal: ITSDocumentDefinition = {
  name: 'orderWithdrawal',
  type: 'document',
  icon: Icon,
  feature: 'shop',
  // Created only by the web endpoint or the "Declare withdrawal" order action —
  // never via a blank create form.
  allowCreate: false,
  disallowedActions: ['delete', 'duplicate'],
  build: (ctx) => {
    const { f } = ctx
    return {
      // Edits save straight to the published doc — no draft whose publish would revert what the
      // actions wrote (status, orderRef). Assigning is an action, not a field edit.
      liveEdit: true,
      // Guide box above the form: next step, refund deadline, "how it works".
      components: { input: WithdrawalGuideInput },
      fields: [
        // Set by the web endpoint, "Declare withdrawal" or the "Assign order" action.
        f('orderRef', 'reference', {
          to: [{ type: 'order' }],
          readOnly: !ctx.config.isDev,
        }),
        f('declaredAt', 'datetime', {
          readOnly: !ctx.config.isDev,
          options: ctx.format.dateFormat('datetime'),
          validation: (rule) => rule.required(),
        }),
        f('status', 'string', {
          options: {
            list: [
              { value: 'unmatched' },
              { value: 'received' },
              { value: 'processing' },
              { value: 'refunded' },
              { value: 'rejected' },
            ],
            layout: 'dropdown',
          },
          initialValue: 'received',
          // Offers received / processing / rejected only: `unmatched` is left by assigning an
          // order, `refunded` is set by "Refund & close".
          components: { input: WithdrawalStatusInput },
          validation: (rule) => rule.required(),
        }),
        // When "Assign order" linked the order (Studio assignments only — undo is offered for these).
        f('assignedAt', 'datetime', {
          readOnly: !ctx.config.isDev,
          hidden: !ctx.config.isDev,
        }),
        // What the consumer submitted via the web form (FAGG §13a) — read-only proof.
        f('name', 'string', { readOnly: !ctx.config.isDev }),
        f('email', 'string', { readOnly: !ctx.config.isDev }),
        f('orderNumber', 'string', { readOnly: !ctx.config.isDev }),
        f('locale', 'string', { hidden: !ctx.config.isDev, readOnly: !ctx.config.isDev }),
        f('reason', 'text', { rows: 3 }),
        f('note', 'text', { rows: 2 }),
      ],
      preview: {
        select: {
          orderNumber: 'orderRef.orderNumber',
          submittedOrderNumber: 'orderNumber',
          status: 'status',
          declaredAt: 'declaredAt',
        },
        prepare: ({ orderNumber, submittedOrderNumber, status, declaredAt }) => ({
          title: ctx.t
            .default('orderWithdrawal.preview.title', 'Withdrawal #{{orderNumber}}', {
              orderNumber: orderNumber ?? submittedOrderNumber ?? '',
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
