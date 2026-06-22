import type { MailType } from './mail'

export type FrontendResponse<T = unknown> =
  | { data: T; error?: undefined }
  | { error: string; data?: undefined }

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
  to: string
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
    options?: { attachInvoice?: boolean },
  ) => Promise<FrontendResponse<NotifyResult>>
  /**
   * Trigger a Stripe refund. Pass `amount` (cents) for partial refunds; omit
   * for a full refund.
   */
  refundPayment: (
    paymentIntentId: string,
    options?: { amount?: number },
  ) => Promise<FrontendResponse<RefundResult>>
  /**
   * (Re)send the customer withdrawal confirmation email for an existing
   * `orderWithdrawal` record (manual logging or after a delivery failure).
   */
  withdrawNotify: (withdrawalId: string) => Promise<FrontendResponse<WithdrawNotifyResult>>
}
