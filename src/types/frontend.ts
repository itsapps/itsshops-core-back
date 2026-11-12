import type { MailType } from './mail'

export type FrontendResponse<T = unknown> =
  | { data: T; error?: undefined; code?: undefined }
  /** `code`: core-front's error code when it sent one (e.g. `REFUND_CONFLICT`). */
  | { error: string; code?: string; data?: undefined }

export type RefundResult = {
  refundId: string
  status: string
  amount: number | null
}

export type NotifyResult = {
  messageId: string
  to: string
  mailType: MailType
}

export type WithdrawNotifyResult = {
  /** The order's address (matched) or the submitted one (unmatched). */
  to: string
  /** Every address a receipt went to (core-front ≥ 5.0.0): `to` + the submitted one if it differs. */
  recipients?: string[]
}

export type ITSFrontendClient = {
  /**
   * Trigger a customer notification email for the given order. The core-front
   * notify function loads the order from Sanity, picks the matching template,
   * optionally renders an invoice PDF, and sends via Mailgun.
   */
  notifyOrder: (
    mailType: MailType,
    orderId: string,
    options?: { attachInvoice?: boolean; refundAmount?: number; customerMessage?: string },
  ) => Promise<FrontendResponse<NotifyResult>>
  /**
   * Trigger a Stripe refund of the order's payment (core-front looks up the
   * PaymentIntent from the order). Pass `amount` (cents) for partial refunds;
   * omit for a full refund. `expectedRefunded` (cents, counted refunds the
   * dialog showed): core-front refuses with `REFUND_CONFLICT` when Stripe's
   * refunds differ (another tab / editor refunded meanwhile).
   */
  refundPayment: (
    orderId: string,
    options?: { amount?: number; expectedRefunded?: number },
  ) => Promise<FrontendResponse<RefundResult>>
  /**
   * (Re)send the customer withdrawal confirmation email for an existing
   * `orderWithdrawal` record (manual logging or after a delivery failure).
   */
  withdrawNotify: (withdrawalId: string) => Promise<FrontendResponse<WithdrawNotifyResult>>
}
