// Sums over an order's stored Stripe refunds (`order.refunds`, written by core-front).
// Failed / canceled refunds don't count — Stripe doesn't count them in `amount_refunded`
// either; pending ones do.

export type RefundLike = { amount: number; status?: string }

const counts = (refund: RefundLike): boolean =>
  refund.status !== 'failed' && refund.status !== 'canceled'

/** Cents refunded so far (counted refunds only). */
export const refundedTotal = (refunds?: RefundLike[]): number =>
  (refunds ?? []).filter(counts).reduce((sum, refund) => sum + (refund.amount ?? 0), 0)

/**
 * Cents still refundable: grand total minus counted refunds, never below 0. Orders refunded
 * before refunds were stored have none → the grand total.
 */
export const remainingAmount = (grandTotal: number, refunds?: RefundLike[]): number =>
  Math.max(0, grandTotal - refundedTotal(refunds))
