/**
 * The Studio's refund step, shared by the order's status dialog and the withdrawal's
 * "Refund & close": stale check → Stripe refund (via core-front) → one order patch.
 *
 * `expected` is a snapshot of the order taken when the dialog opened; the order is re-fetched and
 * the refund refused when its payment status or refunded total changed meanwhile (two tabs / two
 * editors). That re-fetch only sees refunds already synced onto the order (2–3 s after Stripe),
 * so the snapshot also goes to core-front's `payment-refund` as `expectedRefunded`, which compares
 * it with Stripe's live refunds; a mismatch (and a replayed idempotency key for truly simultaneous
 * requests) answers `REFUND_CONFLICT` → `changedMeanwhile` here: no patch, no mail.
 * The server loads the PaymentIntent from the order — the Studio only sends the order id.
 *
 * Mails stay with the callers.
 */
import type { SanityClient } from 'sanity'

import type { ITSFrontendClient } from '../../types/frontend'
import { buildRefundPatch, refundedTotal, type RefundLike } from '../../utils/orderRefunds'
import type { OrderPaymentStatus, OrderStatus } from '../../utils/orderTransitions'

export type RefundSnapshot = { paymentStatus: OrderPaymentStatus; refundedCents: number }

/** Snapshot of an order for `refundOrder`'s stale check. */
export const refundSnapshot = (order: {
  paymentStatus: OrderPaymentStatus
  refunds?: RefundLike[]
}): RefundSnapshot => ({
  paymentStatus: order.paymentStatus,
  refundedCents: refundedTotal(order.refunds),
})

export type RefundOrderResult =
  | { ok: true; refundedCents?: number }
  | { ok: false; code: 'changedMeanwhile' | 'refundFailed' | 'patchFailed'; message?: string }

export async function refundOrder({
  sanityClient,
  frontendClient,
  order,
  expected,
  refund,
  amountCents,
  note,
  markReturned = false,
  newKey = () => crypto.randomUUID(),
  now = () => new Date(),
}: {
  sanityClient: Pick<SanityClient, 'fetch' | 'patch'>
  frontendClient: Pick<ITSFrontendClient, 'refundPayment'>
  order: { _id: string; status: OrderStatus }
  expected: RefundSnapshot
  /** `none`: no refund, only `markReturned`. */
  refund: 'full' | 'partial' | 'none'
  /** Partial refunds: cents. */
  amountCents?: number
  note?: string
  markReturned?: boolean
  newKey?: () => string
  now?: () => Date
}): Promise<RefundOrderResult> {
  const current = await sanityClient.fetch<{
    paymentStatus: OrderPaymentStatus
    refunds?: RefundLike[]
  } | null>(`*[_id == $id][0]{ paymentStatus, "refunds": refunds[]{ amount, status } }`, {
    id: order._id,
  })
  if (
    !current ||
    current.paymentStatus !== expected.paymentStatus ||
    refundedTotal(current.refunds) !== expected.refundedCents
  ) {
    return { ok: false, code: 'changedMeanwhile' }
  }

  let refundedCents: number | undefined
  if (refund !== 'none') {
    const result = await frontendClient.refundPayment(order._id, {
      ...(refund === 'partial' && amountCents !== undefined && { amount: amountCents }),
      // core-front compares it with Stripe's live refunds: catches a second tab whose refund
      // isn't synced onto the order yet (the re-fetch above only sees synced refunds).
      expectedRefunded: expected.refundedCents,
    })
    if (result.code === 'REFUND_CONFLICT') return { ok: false, code: 'changedMeanwhile' }
    if (result.error) return { ok: false, code: 'refundFailed', message: result.error }
    refundedCents = result.data?.amount ?? undefined
  }

  const { set, historyEntries } = buildRefundPatch(order, {
    refund,
    markReturned,
    note,
    timestamp: now().toISOString(),
    newKey,
  })
  if (historyEntries.length) {
    try {
      await sanityClient
        .patch(order._id)
        .set(set)
        .append('statusHistory', historyEntries)
        .commit({ autoGenerateArrayKeys: false, returnDocuments: false })
    } catch (err) {
      return {
        ok: false,
        code: 'patchFailed',
        message: err instanceof Error ? err.message : String(err),
      }
    }
  }
  return { ok: true, refundedCents }
}
