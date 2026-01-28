export const SendMailTypes = {
  ORDER_CONFIRMATION: 'order-confirmation',
  ORDER_PROCESSING: 'order-processing',
  ORDER_INVOICE: 'order-invoice',
  ORDER_SHIPPING: 'order-shipping',
  ORDER_DELIVERED: 'order-delivered',
  ORDER_RETURNED: 'order-returned',
  ORDER_CANCELED: 'order-canceled',
  ORDER_REFUNDED: 'order-refunded',
  ORDER_REFUNDED_PARTIALLY: 'order-refunded-partially',
}
export type SendMailType = (typeof SendMailTypes)[keyof typeof SendMailTypes];