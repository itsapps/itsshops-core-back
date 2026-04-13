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
        readOnly: !ctx.config.isDev,
      }),

      f('title', 'string', {
        validation: (rule) => rule.required(),
        readOnly: !ctx.config.isDev,
      }),

      f('subtitle', 'string', {
        readOnly: !ctx.config.isDev,
      }),

      f('weight', 'number', {
        validation: (rule) => rule.min(0).integer(),
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
        validation: (rule) => rule.required().min(0).integer(),
        readOnly: !ctx.config.isDev,
      }),

      f('vatRate', 'number', {
        validation: (rule) => rule.required().min(0),
        readOnly: !ctx.config.isDev,
      }),

      f('vatAmount', 'number', {
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
          subtitle: 'subtitle',
          kind: 'kind',
          quantity: 'quantity',
          price: 'price',
          packed: 'packed',
          weight: 'weight',
        },
        prepare({ title, subtitle, kind, quantity, price, packed, weight }) {
          const priceStr = typeof price === 'number' ? ctx.format.currency(price / 100) : '—'
          const weightStr = typeof weight === 'number' ? `${weight}g` : null
          return {
            title: `${quantity}× ${title}`,
            subtitle: [subtitle, priceStr, weightStr, kind, packed ? '✓' : null].filter(Boolean).join(' · '),
            media: OrderItemIcon,
          }
        },
      },
    }
  },
}
