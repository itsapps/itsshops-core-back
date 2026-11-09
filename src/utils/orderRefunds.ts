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

type RefundMailType = 'orderRefunded' | 'orderRefundedPartially'

/**
 * Whether "Send mail" offers a refund mail for the payment status: the partial-refund mail once
 * anything was refunded, the full-refund mail only for a refunded order.
 */
export const refundMailOffered = (mailType: RefundMailType, paymentStatus?: string): boolean =>
  mailType === 'orderRefunded'
    ? paymentStatus === 'refunded'
    : paymentStatus === 'partiallyRefunded' || paymentStatus === 'refunded'

/**
 * Why core-front would refuse a refund mail sent without an amount ("Send mail") — mirrors its
 * `sendOrderNotification`: the partial-refund mail states the latest stored refund (none →
 * refused); the full-refund mail is refused while stored refunds don't cover the total (no stored
 * refunds at all → it states the total).
 */
export const refundMailBlocked = (
  mailType: RefundMailType,
  grandTotal: number,
  refunds?: RefundLike[],
): 'noStoredRefund' | 'notFullyRefunded' | undefined => {
  if (mailType === 'orderRefundedPartially') {
    return (refunds ?? []).some(counts) ? undefined : 'noStoredRefund'
  }
  return refunds?.length && refundedTotal(refunds) < grandTotal ? 'notFullyRefunded' : undefined
}
