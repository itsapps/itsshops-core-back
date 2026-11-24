import { ITSSchemaDefinition } from '../../../types'

/**
 * What was actually charged, snapshotted by the payment webhook from the Stripe charge
 * (`latest_charge.payment_method_details`) at `payment_intent.succeeded`. Only PCI-allowed
 * truncation (brand + last 4) — never a full card number / IBAN, expiry or CVC.
 * Absent on orders created before it existed.
 */
export const orderPaymentMethod: ITSSchemaDefinition = {
  name: 'orderPaymentMethod',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx
    const readOnly = !ctx.config.isDev
    return {
      fields: [
        // Stripe payment method type: card, eps, klarna, paypal, sepa_debit, …
        f('type', 'string', { readOnly }),
        // Card brand (visa, mastercard, …)
        f('brand', 'string', { readOnly }),
        f('last4', 'string', { readOnly }),
        // Card wallet: apple_pay, google_pay, link, …
        f('wallet', 'string', { readOnly }),
      ],
    }
  },
}
