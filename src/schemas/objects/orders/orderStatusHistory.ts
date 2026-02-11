import { ITSSchemaDefinition, ProductType } from '../../../types';
import { getStateTranslationKey } from '../../../utils/orders';

import { PackageIcon } from '@sanity/icons'
import { FieldDefinition, isDev } from 'sanity'

export const orderStatusHistory: ITSSchemaDefinition = {
  name: 'orderStatusHistory',
  type: 'object',
  feature: 'shop',
  icon: PackageIcon,
  build: (ctx) => {
    const { f } = ctx;

    const fields = [
      f('type', 'string', {
        options: {
          list: [
            { value: 'payment' },
            { value: 'fulfillment' },
          ],
        },
        validation: (Rule) => Rule.required(),
      }),

      f('status', 'string', { validation: (Rule) => Rule.required() }),

      f('timestamp', 'datetime', {
        initialValue: () => new Date().toISOString(),
        validation: (Rule) => Rule.required()
      }),

      f('source', 'string'),

      f('note', 'text', {
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
          const dateTime = timestamp ? ctx.format.date(timestamp, { dateStyle: 'medium', timeStyle: 'medium' }) : 'No Date'
          const typeString = type ? ctx.t.default(`orderStatusHistory.fields.type.options.${type}`, type) : 'No Type'
          const statusString = status ? ctx.t.default(getStateTranslationKey(status), status) : 'No Status'
          const subtitle = [source, note].filter(Boolean).join(' - ')
          return {
            title: `${dateTime}: ${typeString} - ${statusString}`,
            subtitle,
          }
        }
      },
    }
  }
}