// State machine for order fulfillment + payment status transitions.
//
// Orders are not edited directly in the studio — `status` and `paymentStatus`
// are read-only on the schema. Admins drive transitions through the
// `OrderActions` document action, which only offers the legal next states
// computed from the maps below.

export type OrderStatus =
  | 'created'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'canceled'
  | 'returned'

export type OrderPaymentStatus = 'succeeded' | 'refunded' | 'partiallyRefunded'

export type StatusActionType = 'fulfillment' | 'payment'

export type StatusAction =
  | { type: 'fulfillment'; newState: OrderStatus; label: string }
  | { type: 'payment'; newState: OrderPaymentStatus; label: string }

export type MailType =
  | 'orderConfirmation'
  | 'orderProcessing'
  | 'orderInvoice'
  | 'orderShipping'
  | 'orderDelivered'
  | 'orderReturned'
  | 'orderCanceled'
  | 'orderRefunded'
  | 'orderRefundedPartially'

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

// A fully-refunded order is locked — no further fulfillment changes allowed.
export const getAllowedFulfillmentTransitions = (
  currentStatus: OrderStatus,
  paymentStatus: OrderPaymentStatus,
): OrderStatus[] => {
  if (paymentStatus === 'refunded') return []
  return fulfillmentTransitions[currentStatus] ?? []
}

export const getAllowedPaymentTransitions = (
  currentStatus: OrderPaymentStatus,
): OrderPaymentStatus[] => {
  return paymentTransitions[currentStatus] ?? []
}

// The mail to send when a transition completes. Some transitions don't
// trigger a customer notification (e.g. created, succeeded).
export const mailTypeForStatus = (
  status: OrderStatus | OrderPaymentStatus | undefined,
): MailType | undefined => {
  switch (status) {
    case 'processing': return 'orderProcessing'
    case 'shipped': return 'orderShipping'
    case 'delivered': return 'orderDelivered'
    case 'returned': return 'orderReturned'
    case 'canceled': return 'orderCanceled'
    case 'refunded': return 'orderRefunded'
    case 'partiallyRefunded': return 'orderRefundedPartially'
    default: return undefined
  }
}

const stateTranslationKeys: Record<OrderStatus | OrderPaymentStatus, string> = {
  created: 'order.fields.status.options.created',
  processing: 'order.fields.status.options.processing',
  shipped: 'order.fields.status.options.shipped',
  delivered: 'order.fields.status.options.delivered',
  canceled: 'order.fields.status.options.canceled',
  returned: 'order.fields.status.options.returned',
  succeeded: 'order.fields.paymentStatus.options.succeeded',
  refunded: 'order.fields.paymentStatus.options.refunded',
  partiallyRefunded: 'order.fields.paymentStatus.options.partiallyRefunded',
}

export const getStateTranslationKey = (state: OrderStatus | OrderPaymentStatus): string =>
  stateTranslationKeys[state] ?? state
