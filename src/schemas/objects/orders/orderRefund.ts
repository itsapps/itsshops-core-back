import { OrderStatusHistoryIcon } from '../../../assets/icons'
import { ITSSchemaDefinition } from '../../../types'

// One Stripe refund of the order. Written only by core-front (`syncOrderRefunds`: rebuilt from
// Stripe's refund list by `payment-refund` and the `charge.refunded` / `refund.updated` webhooks).
export const orderRefund: ITSSchemaDefinition = {
  name: 'orderRefund',
  type: 'object',
  feature: 'shop',
  icon: OrderStatusHistoryIcon,
  build: (ctx) => {
    const { f } = ctx
    const readOnly = !ctx.config.isDev

    const fields = [
      // Stripe refund id (re_…)
      f('refundId', 'string', { readOnly, validation: (Rule) => Rule.required() }),
      // Cents
      f('amount', 'number', {
        readOnly,
        validation: (Rule) => Rule.required().integer(),
      }),
      f('createdAt', 'datetime', { readOnly }),
      // Stripe's refund status: pending | succeeded | failed | canceled | requires_action
      f('status', 'string', { readOnly }),
      // Stripe's failure_reason, e.g. expired_or_canceled_card
      f('failureReason', 'string', { readOnly }),
      // studio (created via payment-refund) | stripe (Stripe dashboard)
      f('source', 'string', { readOnly }),
      // Stripe's reason enum (duplicate | fraudulent | requested_by_customer | …)
      f('reason', 'string', { readOnly }),
    ]

    return {
      fields,
      preview: {
        select: {
          amount: 'amount',
          createdAt: 'createdAt',
          source: 'source',
          status: 'status',
        },
        prepare({ amount, createdAt, source, status }) {
          const date = createdAt
            ? ctx.format.date(createdAt, { dateStyle: 'medium', timeStyle: 'short' })
            : 'No Date'
          const money = typeof amount === 'number' ? ctx.format.currency(amount / 100) : '–'
          return {
            title: [date, money, source].filter(Boolean).join(' · '),
            subtitle: status && status !== 'succeeded' ? status : undefined,
          }
        },
      },
    }
  },
}
