import { FieldDefinition } from 'sanity'

import { OrderItemIcon } from '../../../assets/icons'
import { ITSSchemaDefinition } from '../../../types'

export const orderItem: ITSSchemaDefinition = {
  name: 'orderItem',
  type: 'object',
  feature: 'shop',
  icon: OrderItemIcon,
  build: (ctx) => {
    const { f } = ctx

    const isKind =
      (kind: string) =>
      ({ parent }: { parent?: { kind?: string } }) =>
        parent?.kind !== kind

    const isNotKind =
      (...kinds: string[]) =>
      ({ parent }: { parent?: { kind?: string } }) =>
        !kinds.includes(parent?.kind ?? '')

    const fields: FieldDefinition[] = [
      // ─── Base fields ────────────────────────────────────────────────────────

      f('kind', 'string', {
        options: {
          list: ctx.config.schemaSettings.productKinds.map((type) => ({ value: type })),
          layout: 'dropdown',
        },
        validation: (rule) => rule.required(),
        readOnly: !ctx.config.isDev,
      }),

      f('variantId', 'string', {
        validation: (rule) => rule.required(),
        readOnly: !ctx.config.isDev,
      }),

      f('productId', 'string', {
        validation: (rule) => rule.required(),
        readOnly: !ctx.config.isDev,
      }),

      f('parentId', 'string', {
        description: 'Set on bundle child items — points to the parent bundle orderItem._key',
        readOnly: !ctx.config.isDev,
      }),

      f('title', 'string', {
        description: 'Snapshotted product title, resolved at checkout',
        validation: (rule) => rule.required(),
        readOnly: !ctx.config.isDev,
      }),

      f('variantTitle', 'string', {
        description: 'Snapshotted variant subtitle, resolved at checkout',
        readOnly: !ctx.config.isDev,
      }),

      f('sku', 'string', {
        readOnly: !ctx.config.isDev,
      }),

      f('quantity', 'number', {
        validation: (rule) => rule.required().min(1).integer(),
        readOnly: !ctx.config.isDev,
      }),

      f('price', 'number', {
        description: 'Unit price in cents',
        validation: (rule) => rule.required().min(0).integer(),
        readOnly: !ctx.config.isDev,
      }),

      f('vatRate', 'number', {
        description: 'VAT rate as a percentage, e.g. 20 for 20%',
        validation: (rule) => rule.required().min(0),
        readOnly: !ctx.config.isDev,
      }),

      f('vatAmount', 'number', {
        description: 'Total VAT for this line in cents (quantity × unit vat)',
        validation: (rule) => rule.required().min(0).integer(),
        readOnly: !ctx.config.isDev,
      }),

      f('packed', 'boolean', {
        initialValue: false,
      }),

      // ─── Kind-specific snapshots ─────────────────────────────────────────────

      f('wine', 'orderItemWine', {
        hidden: isKind('wine'),
      }),

      f('options', 'array', {
        of: [{ type: 'orderItemOption' }],
        description: 'Snapshotted option group/value pairs',
        hidden: isNotKind('physical', 'digital'),
        options: {
          ...(!ctx.config.isDev && {
            disableActions: ['add', 'duplicate', 'addBefore', 'addAfter', 'copy', 'remove'],
          }),
          sortable: false,
        },
      }),

      f('bundle', 'orderItemBundle', {
        hidden: isKind('bundle'),
      }),
    ]

    return {
      fields,
      preview: {
        select: {
          title: 'title',
          variantTitle: 'variantTitle',
          kind: 'kind',
          quantity: 'quantity',
          price: 'price',
          packed: 'packed',
        },
        prepare({ title, variantTitle, kind, quantity, price, packed }) {
          const label = [title, variantTitle].filter(Boolean).join(' — ')
          const priceStr = typeof price === 'number' ? ctx.format.currency(price / 100) : '—'
          return {
            title: `${quantity}× ${label}`,
            subtitle: `${priceStr} · ${kind}${packed ? ' ✓' : ''}`,
            media: OrderItemIcon,
          }
        },
      },
    }
  },
}
