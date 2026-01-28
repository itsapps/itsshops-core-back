import {
  TFunction,
} from 'sanity'
import { Order, OrderPaymentStatus, OrderStatus, StatusAction } from '../types/orders'
import { SendMailType, SendMailTypes } from '../types/mail'

const fulfillmentTransitions: Record<OrderStatus, OrderStatus[]> = {
  created: ['processing', 'canceled'],
  processing: ['shipped', 'canceled'],
  shipped: ['delivered', 'returned'],
  delivered: [],
  returned: [],
  canceled: [],
}

const paymentTransitions: Record<OrderPaymentStatus, OrderPaymentStatus[]> = {
  succeeded: ['refunded', 'partiallyRefunded'],
  partiallyRefunded: ['refunded'],
  refunded: [],
}

export const getFullfillmentActions = (order: Order, t: TFunction): {fulfillmentActions: StatusAction[], paymentActions: StatusAction[]} => {
  // Compute possible actions
  const fulfillmentActions: StatusAction[] = []
  const paymentActions: StatusAction[] = []
  const fulfillmentOptions = getAllowedFulfillmentTransitions(order.status, order.paymentStatus)
  fulfillmentOptions.forEach(s => fulfillmentActions.push({ type: 'fulfillment', newState: s, label: t(getStateTranslationKey(s)) }))
  const paymentOptions = getAllowedPaymentTransitions(order.paymentStatus)
  paymentOptions.filter(s => s !== 'partiallyRefunded').forEach(s => paymentActions.push({ type: 'payment', newState: s, label: t(getStateTranslationKey(s)) }))
  return { fulfillmentActions, paymentActions }
}

/**
 * Get allowed fulfillment transitions for an order.
 * Locks fulfillment transitions if paymentStatus = "refunded"
 */
export function getAllowedFulfillmentTransitions(
  currentStatus: OrderStatus,
  paymentStatus: OrderPaymentStatus
): OrderStatus[] {
  if (paymentStatus === "refunded") {
    return [] // lock order if fully refunded
  }
  return fulfillmentTransitions[currentStatus] ?? []
}

export function canChangeToFullfillmentStatus(status: OrderStatus, order: Order): boolean {
  const possibleStates = getAllowedFulfillmentTransitions(order.status, order.paymentStatus)
  return possibleStates.includes(status)
}

/**
 * Get allowed payment transitions for an order
 */
export function getAllowedPaymentTransitions(
  currentStatus: OrderPaymentStatus
): OrderPaymentStatus[] {
  return paymentTransitions[currentStatus] ?? []
}


export const mailTypeForStatus = (status: OrderStatus | OrderPaymentStatus | undefined): SendMailType | undefined => {
  if (!status) return undefined

  // if (status === 'created') return 'orderCreated'
  if (status === 'processing') return SendMailTypes.ORDER_PROCESSING
  if (status === 'shipped') return SendMailTypes.ORDER_SHIPPING
  if (status === 'delivered') return SendMailTypes.ORDER_DELIVERED
  if (status === 'returned') return SendMailTypes.ORDER_RETURNED
  if (status === 'canceled') return SendMailTypes.ORDER_CANCELED
  // if (status === 'succeeded') return 'orderPaymentSucceeded'
  if (status === 'refunded') return SendMailTypes.ORDER_REFUNDED
  if (status === 'partiallyRefunded') return SendMailTypes.ORDER_REFUNDED_PARTIALLY

  return undefined
}

export const stateTranslationMap: Record<OrderPaymentStatus | OrderStatus, string> = {
  created: 'order.status.options.created',
  processing: 'order.status.options.processing',
  shipped: 'order.status.options.shipped',
  delivered: 'order.status.options.delivered',
  canceled: 'order.status.options.canceled',
  returned: 'order.status.options.returned',
  succeeded: 'order.paymentStatus.options.succeeded',
  refunded: 'order.paymentStatus.options.refunded',
  partiallyRefunded: 'order.paymentStatus.options.partiallyRefunded',
};

export const getStateTranslationKey = (state: OrderPaymentStatus | OrderStatus) => {
  return stateTranslationMap[state] || state
}