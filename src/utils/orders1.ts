import { z } from 'zod';
import { Order as GeneratedOrder , OrderStatusHistory as GeneratedHistory} from '../types/sanity.types';

// 1. Extract the string literal unions from TypeGen
type OrderStatus = NonNullable<GeneratedOrder['status']>;
type OrderPaymentStatus = NonNullable<GeneratedOrder['paymentStatus']>;

export type HistoryType = NonNullable<GeneratedHistory['type']>;

// We define what we REQUIRE for our UI to render correctly
export interface StrictHistoryEntry extends Omit<GeneratedHistory, 'type' | 'status' | 'timestamp'> {
  _key: string;      // Always present in Sanity arrays
  type: HistoryType; // Fulfillment or Payment
  status: string;    // Guaranteed string
  timestamp: string; // Guaranteed ISO date
}
export const statusHistoryEntrySchema = z.object({
  _key: z.string(),
  // Use the generated literals for validation
  type: z.enum(['payment', 'fulfillment'] as const).catch('fulfillment'),
  status: z.string().catch('unknown'),
  timestamp: z.string().catch(() => new Date().toISOString()),
  source: z.string().catch('system'),
  note: z.string().optional(),
});

export const strictOrderTotalsSchema = z.object({
  _type: z.literal("orderTotals"),
  grandTotal: z.number(),
  subtotal: z.number(),
  shipping: z.number().default(0),
  discount: z.number().default(0),
  totalVat: z.number(),
});

// --- 2. Customer Schema ---
export const strictOrderCustomerSchema = z.object({
  _type: z.literal("orderCustomer"),
  locale: z.enum(["de", "en"]),
  contactEmail: z.email(),
  supabaseId: z.string().optional(),
  // Assuming AddressStrict is validated elsewhere or just passed through
  billingAddress: z.any().optional(),
  shippingAddress: z.any().optional(),
});

// 2. Define the Zod Schema (The Bodyguard)
export const strictOrderSchema = z.object({
  _id: z.string(),
  _createdAt: z.string(),
  // Use .catch() or .default() to handle missing/old data
  orderNumber: z.string(),
  invoiceNumber: z.string(),
  status: z.custom<OrderStatus>(),
  paymentStatus: z.custom<OrderPaymentStatus>(),
  // Add other required fields here
  statusHistory: z.array(statusHistoryEntrySchema).default([]),
});

// 3. Infer the Strict type from the schema
export type StrictOrder = z.infer<typeof strictOrderSchema>;



export const stateTranslationMap: Record<string, string> = {
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
export const getStateTranslationKey = (state: string) => {
  const key = stateTranslationMap[state];
  if (!key && state !== 'unknown') {
    console.warn(`[Engine] Missing translation mapping for status: ${state}`);
  }
  return key || state;
}

// export const getStateTranslationKey = (state: string) => {
//   // Check if the string provided is actually a key in our map
//   if (state in stateTranslationMap) {
//     return stateTranslationMap[state as keyof typeof stateTranslationMap];
//   }
//   // If it's not in the map (like "unknown" or a deleted status), 
//   // return the string itself or a fallback translation key
//   return state; 
// }
// export const getStateTranslationKey = (state: OrderPaymentStatus | OrderStatus) => {
//   return stateTranslationMap[state] || state
// }