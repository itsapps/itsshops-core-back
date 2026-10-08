import { OrderWithdrawalIcon as Icon } from '../../../assets/icons'
import { WithdrawalOrderInput } from '../../../components/WithdrawalOrderInput'
import { ITSDocumentDefinition } from '../../../types'

/** Withdrawals that still block a new one on the same order. */
const OPEN_STATUSES = ['received', 'processing']

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
 * assign it to an order (status then follows: `received`) or delete it after
 * checking. Matched records are never deleted (proof that a declaration was
 * received); mark ineligible ones `rejected` instead. Delete is re-added as a
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
      fields: [
        f('orderRef', 'reference', {
          to: [{ type: 'order' }],
          // Editable only while the published record is unmatched — the input
          // renders read-only otherwise and keeps `status` in sync with the value.
          components: { input: WithdrawalOrderInput },
          options: {
            // Orders that already have an open withdrawal can't be picked.
            filter: `!(_id in *[_type == "orderWithdrawal" && status in $open && defined(orderRef._ref)].orderRef._ref)`,
            filterParams: { open: OPEN_STATUSES },
          },
          validation: (rule) =>
            rule.custom(async (value: { _ref?: string } | undefined, context) => {
              const status = (context.document as { status?: string } | undefined)?.status
              if (!value?._ref) {
                return status === 'unmatched' ? true : ctx.t.default('validation.requiredField')
              }
              if (status === 'unmatched') {
                return ctx.t.default('validation.withdrawalUnmatchedWithOrder')
              }
              // Guards races the picker filter can't: another open withdrawal on that order.
              const selfId = (context.document?._id ?? '').replace(/^drafts\./, '')
              const others = await context
                .getClient({ apiVersion: ctx.config.apiVersion })
                .fetch<number>(
                  `count(*[_type == "orderWithdrawal" && orderRef._ref == $order && status in $open && !(_id in [$self, "drafts." + $self])])`,
                  { order: value._ref, open: OPEN_STATUSES, self: selfId },
                )
              return others > 0 ? ctx.t.default('validation.withdrawalOrderHasOpen') : true
            }),
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
          // `unmatched` is set by the endpoint and left only by assigning an order.
          readOnly: ({ document }) => document?.status === 'unmatched',
          validation: (rule) => rule.required(),
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
