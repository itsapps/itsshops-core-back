import {
  TFunction,
} from 'sanity'
// import { Order, OrderPaymentStatus, OrderStatus, StatusAction } from '../types/orders'
// import { Order } from '../types/sanity.types'
import { SendMailType, SendMailTypes } from '../types/mail'
import { z } from 'zod';
import { Order, OrderStatusHistory } from '../types/sanity.types';

// 1. Extract pure literals from TypeGen
export type OrderStatus = NonNullable<Order['status']>;
export type OrderPaymentStatus = NonNullable<Order['paymentStatus']>;

export type StrictHistoryEntry = {
  _key: string;
  type: 'payment' | 'fulfillment';
  status: OrderStatus | OrderPaymentStatus; // It's always one of these two
  timestamp: string;
  source: string;
  note?: string;
};

// Define the full Strict Order
export type StrictOrder = Omit<Order, 'status' | 'paymentStatus' | 'statusHistory'> & {
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  statusHistory: StrictHistoryEntry[];
};

// 2. Define the Strict Schema
export const strictOrderSchema = z.object({
  _id: z.string(),
  _createdAt: z.string(),
  orderNumber: z.string().catch('NEW'),
  invoiceNumber: z.string().optional(),
  // Use .catch() to ensure these are NEVER undefined in your logic
  status: z.custom<OrderStatus>().catch('created'),
  paymentStatus: z.custom<OrderPaymentStatus>().catch('succeeded'),
  statusHistory: z.array(
    z.object({
      _key: z.string(),
      type: z.enum(['payment', 'fulfillment']).catch('fulfillment'),
      status: z.string().catch('unknown'), // We'll handle the union in logic
      timestamp: z.string().catch(() => new Date().toISOString()),
      source: z.string().catch('system'),
      note: z.string().optional(),
    })
  ).catch([]),
});

// 3. Export the Strict Type
// export type StrictOrder = z.infer<typeof strictOrderSchema>;



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

export const getFullfillmentActions = (order: StrictOrder, t: TFunction): {fulfillmentActions: StatusAction[], paymentActions: StatusAction[]} => {
/**
 * Compute possible fulfillment and payment actions for an order.
 * Locks fulfillment and payment transitions if paymentStatus = "refunded"
 * @param order - The order to compute fulfillment and payment actions for
 * @param t - The translation function
 * @returns An object with fulfillmentActions and paymentActions
 */
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

export function canChangeToFullfillmentStatus(status: OrderStatus, order: StrictOrder): boolean {
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
  created: 'order.fields.status.options.created',
  processing: 'order.fields.status.options.processing',
  shipped: 'order.fields.status.options.shipped',
  delivered: 'order.fields.status.options.delivered',
  canceled: 'order.fields.status.options.canceled',
  returned: 'order.fields.status.options.returned',
  succeeded: 'order.fields.paymentStatus.options.succeeded',
  refunded: 'order.fields.paymentStatus.options.refunded',
  partiallyRefunded: 'order.fields.paymentStatus.options.partiallyRefunded',
};

export const getStateTranslationKey = (state: OrderPaymentStatus | OrderStatus) => {
  return stateTranslationMap[state] || state
}