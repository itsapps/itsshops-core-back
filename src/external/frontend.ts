import { v4 as uuidv4 } from 'uuid'

import { ITSFrontendClient, SendMailType } from '../types'

export const createFrontendClient = (
  locale: string,
  endpoint: string,
  secret: string,
): ITSFrontendClient => {
  const requestData = async (accept: string, path: string, payload?: Record<string, any>) => {
    const requestId = uuidv4().replaceAll('-', '')
    const merged = {
      requestId,
      secret,
      ...payload,
    }

    try {
      const response = await fetch(endpoint + path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: accept,
          'Accept-Language': locale,
          'X-Request-ID': requestId,
        },
        body: JSON.stringify(merged),
      })

      if (accept === 'application/json') {
        const data = await response.json()
        if (response.ok) {
          return { data }
        }
        return { error: data.meta?.details || data.message || response.statusText }
      }
      if (response.ok) {
        return { data: response }
      }
      return { error: response.statusText }
    } catch (err) {
      const error = err as Error
      // Network error or thrown above
      console.error('API call failed:', err)
      // throw err
      return { error: error.message }
    }
  }

  const post = async (path: string, payload: any) => {
    return await requestData('application/json', path, payload)
  }
  const postPdf = async (path: string, payload: any) => {
    return await requestData('application/pdf', path, payload)
  }
  const postXlsx = async (path: string, payload: any) => {
    return await requestData(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      path,
      payload,
    )
  }

  return {
    sendMail: (mailType: SendMailType, orderId: string) => post(`/mail`, { mailType, orderId }),
    sendRefund: (paymentIntentId: string, options: { amount?: number } = {}) =>
      post(`/payment/refund`, {
        paymentIntentId,
        ...(options.amount && { amount: options.amount }),
      }),
    getOrderInvoicePdf: (orderId: string) => postPdf(`/pdf/invoice`, { orderId }),
    getExportXlsx: (kind: string) => postXlsx(`/export`, { format: 'xlsx', kind }),
  }
}
