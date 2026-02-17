import { ITSi18nArray } from './localization';
import { SendMailType } from './mail';

import { SanityDocument } from 'sanity';

export type Address = {
  city: string;
  country: string;
  zip: string;
  state?: string;
  name: string;
  prename: string;
  lastname: string;
  phone?: string;
  line1: string;
  line2?: string;
};

export type Shipping = {
  address: Address;
  rateTitle: string;
  rateId: string;
  rateCost: number;
}

export type OrderItemOption = {
  title?: ITSi18nArray,
  group?: ITSi18nArray
}

export type BaseOrderItem = {
  _key: string
  type: string
  productId: string
  parentId?: string
  sku?: string
  price: number
  quantity: number
  title: Record<string, string>
  packed: boolean
  orderId: string
}
export type OrderItem = BaseOrderItem & {
  options?: OrderItemOption[]
}
export type OrderItemBundleItem = {
  type: number;
  parentId: string;
  productId: string;
  count: number;
  title: Record<string, string>
}
export type OrderBundleItem = BaseOrderItem & {
  items: OrderItemBundleItem[]
}

export type OrderTotals = {
  subtotal: number;
  total: number;
  vat: number;
  vatRate: number;
  currency: string;
  discount?: number;
}

export type OrderFreeProduct = {
  _key: string;
  title: ITSi18nArray;
  productId: string;
  sku?: string;
  quantity: number;
  packed: boolean;
}

export type OrderVoucher = {
  voucherId: string
  title: Record<string, string>
}

export type OrderPaymentStatus = 'succeeded' | 'refunded' | 'partiallyRefunded'
export type OrderStatus = 'created' | 'processing' | 'shipped' | 'delivered' | 'returned' | 'canceled'

export type StatusHistoryEntry =
  | {
      type: 'payment';
      state: OrderPaymentStatus;
      timestamp: string;
      source?: string;
      note?: string;
    }
  | {
      type: 'fulfillment';
      state: OrderStatus;
      timestamp: string;
      source?: string;
      note?: string;
    };

export type StatusAction =
  | { type: 'fulfillment'; newState: OrderStatus; label: string, mailType?: SendMailType }
  | { type: 'payment'; newState: OrderPaymentStatus; label: string, mailType?: SendMailType };


export interface Order extends SanityDocument {
  orderNumber: string;
  invoiceNumber: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  paymentIntentId: string;
  items: (OrderItem | OrderBundleItem)[];
  contactEmail: string;
  shipping: Shipping;
  billingAddress?: Address;
  totals: OrderTotals;
  freeProducts?: OrderFreeProduct[];
  vouchers?: OrderVoucher[];
  trackingNumber?: string;
  locale: string;
  statusHistory: StatusHistoryEntry[];
}