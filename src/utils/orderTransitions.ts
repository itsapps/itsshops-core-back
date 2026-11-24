// State machine for order fulfillment + payment status transitions.
//
// Orders are not edited directly in the studio — `status` and `paymentStatus`
// are read-only on the schema. Admins drive transitions through the
// `OrderActions` document action, which only offers the legal next states
// computed from the maps below.

export type OrderStatus =
  'created' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'returned'

export type OrderPaymentStatus = 'succeeded' | 'refunded' | 'partiallyRefunded'

export type FulfillmentMethodType = 'delivery' | 'pickup'

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
  // Shops set "delivered" once an order is done, so a withdrawal usually arrives on a delivered
  // order — it must still be able to become `returned` (also after a partial refund).
  delivered: ['returned'],
  returned: [],
  canceled: [],
}

const paymentTransitions: Record<OrderPaymentStatus, OrderPaymentStatus[]> = {
  succeeded: ['refunded', 'partiallyRefunded'],
  // A further partial refund stays partiallyRefunded (capped at the remaining amount).
  partiallyRefunded: ['refunded', 'partiallyRefunded'],
  refunded: [],
}

// A pickup order reuses the states with other labels: `shipped` = "ready for pickup"
// (the goods are still at the shop), `delivered` = "collected". So for pickup only
// `delivered` means "handed over"; an uncollected `shipped` order is cancelled, not returned.
const isHandedOver = (status: OrderStatus, methodType?: FulfillmentMethodType): boolean =>
  methodType === 'pickup' ? status === 'delivered' : status === 'shipped' || status === 'delivered'

// A fully-refunded order is mostly locked, with one exception: goods that were
// already handed over (shipped/delivered; for pickup: collected) can still be marked
// `returned`, since a refund of shipped goods is typically followed by the customer
// returning them. Pre-handover refunds stay terminal (the order is effectively cancelled).
export const getAllowedFulfillmentTransitions = (
  currentStatus: OrderStatus,
  paymentStatus: OrderPaymentStatus,
  methodType?: FulfillmentMethodType,
): OrderStatus[] => {
  if (paymentStatus === 'refunded') {
    return isHandedOver(currentStatus, methodType) ? ['returned'] : []
  }
  if (methodType === 'pickup' && currentStatus === 'shipped') return ['delivered', 'canceled']
  return fulfillmentTransitions[currentStatus] ?? []
}

export const getAllowedPaymentTransitions = (
  currentStatus: OrderPaymentStatus,
): OrderPaymentStatus[] => {
  return paymentTransitions[currentStatus] ?? []
}

// A full refund of a still-undispatched order (for pickup: not yet collected) also
// cancels fulfillment, so the order doesn't stay stuck reading as `created`/`processing`
// (or "ready for pickup"). Shared by the refund action and the withdrawal "resolve" action.
export const refundCancelsFulfillment = (
  currentStatus: OrderStatus,
  methodType?: FulfillmentMethodType,
): boolean =>
  currentStatus === 'created' ||
  currentStatus === 'processing' ||
  (methodType === 'pickup' && currentStatus === 'shipped')

// The mail to send when a transition completes. Some transitions don't
// trigger a customer notification (e.g. created, succeeded).
export const mailTypeForStatus = (
  status: OrderStatus | OrderPaymentStatus | undefined,
): MailType | undefined => {
  switch (status) {
    case 'processing':
      return 'orderProcessing'
    case 'shipped':
      return 'orderShipping'
    case 'delivered':
      return 'orderDelivered'
    case 'returned':
      return 'orderReturned'
    case 'canceled':
      return 'orderCanceled'
    case 'refunded':
      return 'orderRefunded'
    case 'partiallyRefunded':
      return 'orderRefundedPartially'
    default:
      return undefined
  }
}

// Whether the status dialog pre-checks "notify customer" for a transition.
// `delivered` is mostly bookkeeping for the shop (the customer already has the
// parcel), so its mail is opt-in.
export const notifyCustomerByDefault = (
  status: OrderStatus | OrderPaymentStatus | undefined,
): boolean => status !== 'delivered'

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

/**
 * `componentT` key of a fulfillment state's label: pickup orders call `shipped`
 * "Abholbereit" and `delivered` "Abgeholt".
 */
export const statusLabelKey = (state: string, methodType?: FulfillmentMethodType): string =>
  methodType === 'pickup' && (state === 'shipped' || state === 'delivered')
    ? `order.status.pickupOptions.${state}`
    : `order.status.options.${state}`

/** `componentT` key of a mail type's label (pickup: "Abholbereit-Mail" / "Abgeholt-Mail"). */
export const mailTypeLabelKey = (mailType: string, methodType?: FulfillmentMethodType): string =>
  methodType === 'pickup' && (mailType === 'orderShipping' || mailType === 'orderDelivered')
    ? `actions.order.pickupMailTypes.${mailType}`
    : `actions.order.mailTypes.${mailType}`
