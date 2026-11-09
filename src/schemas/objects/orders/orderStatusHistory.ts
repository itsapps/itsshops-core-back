import { OrderStatusHistoryIcon } from '../../../assets/icons'
import { getStateTranslationKey } from '../../../utils/orderTransitions'
import { ITSSchemaDefinition } from '../../../types'

export const orderStatusHistory: ITSSchemaDefinition = {
  name: 'orderStatusHistory',
  type: 'object',
  feature: 'shop',
  icon: OrderStatusHistoryIcon,
  build: (ctx) => {
    const { f } = ctx

    const fields = [
      f('type', 'string', {
        options: {
          list: [{ value: 'payment' }, { value: 'fulfillment' }, { value: 'mail' }],
        },
        validation: (Rule) => Rule.required(),
      }),

      f('status', 'string', { validation: (Rule) => Rule.required() }),

      f('timestamp', 'datetime', {
        initialValue: () => new Date().toISOString(),
        validation: (Rule) => Rule.required(),
      }),

      f('source', 'string'),

      // Internal admin note — studio only, never sent to the customer.
      f('note', 'text', {
        rows: 2,
      }),

      // Message sent to the customer with this mail (`mail` entries, written by core-front;
      // older status entries may carry one).
      f('customerMessage', 'text', {
        rows: 2,
      }),
    ]

    return {
      fields,
      preview: {
        select: {
          status: 'status',
          type: 'type',
          timestamp: 'timestamp',
          source: 'source',
          note: 'note',
        },
        prepare({ status, type, timestamp, source, note }) {
          const dateTime = timestamp
            ? ctx.format.date(timestamp, { dateStyle: 'medium', timeStyle: 'medium' })
            : 'No Date'
          const typeString = type
            ? ctx.schemaT.default(`orderStatusHistory.fields.type.options.${type}`, type)
            : 'No Type'
          const statusString =
            type === 'mail'
              ? ctx.componentT.default(`actions.order.mailTypes.${status}`, status)
              : ctx.t.default(getStateTranslationKey(status), status)
          const sourceString = source
            ? ctx.componentT.default(`order.statusHistory.source.${source}`, source)
            : undefined
          const subtitle = [sourceString, note].filter(Boolean).join(' - ')
          return {
            title: `${dateTime}: ${typeString} - ${statusString}`,
            subtitle,
          }
        },
      },
    }
  },
}
