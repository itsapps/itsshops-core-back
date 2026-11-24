// Mail type vocabulary for the order notification flow.
//
// These string values are the API contract between the studio (which calls the
// notify endpoint with one of them) and the core-front `/api/order/notify`
// function (which picks the matching email template).
//
// Kept in sync with `MailType` in `utils/orderTransitions.ts` and the
// `MailType` mirror in `itsshops-core-front/src/netlify/types/orderTransitions.ts`.

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
