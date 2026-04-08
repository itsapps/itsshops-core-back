import { v4 as uuidv4 } from 'uuid'

import type {
  FrontendResponse,
  ITSFrontendClient,
  MailType,
  NotifyResult,
  RefundResult,
} from '../types'

/**
 * Studio-side client for the customer's deployed core-front server functions.
 *
 * Both endpoints are authenticated via the `x-server-secret` header — `secret`
 * must match `SERVER_FUNCTIONS_SECRET` in the core-front Netlify environment.
 *
 * The endpoint paths assume the customer has wired the core-front handlers
 * under `/api/payment/refund` and `/api/order/notify`.
 */
export const createFrontendClient = (
  locale: string,
  endpoint: string,
  secret: string,
): ITSFrontendClient => {
  const post = async <T>(path: string, payload: unknown): Promise<FrontendResponse<T>> => {
    const requestId = uuidv4().replaceAll('-', '')
    try {
      const response = await fetch(endpoint + path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Language': locale,
          'X-Request-ID': requestId,
          'x-server-secret': secret,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)
      if (response.ok) {
        return { data: data as T }
      }
      const message =
        (data && typeof data === 'object' && 'error' in data && (data as any).error?.message) ||
        (data && typeof data === 'object' && 'message' in data && (data as any).message) ||
        response.statusText
      return { error: message }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error'
      // eslint-disable-next-line no-console
      console.error('Frontend client request failed:', err)
      return { error: message }
    }
  }

  return {
    notifyOrder: (mailType: MailType, orderId: string, options = {}) =>
      post<NotifyResult>('/api/order/notify', {
        mailType,
        orderId,
        ...(options.attachInvoice !== undefined && { attachInvoice: options.attachInvoice }),
      }),
    refundPayment: (paymentIntentId: string, options = {}) =>
      post<RefundResult>('/api/payment/refund', {
        paymentIntentId,
        ...(options.amount !== undefined && { amount: options.amount }),
      }),
  }
}
