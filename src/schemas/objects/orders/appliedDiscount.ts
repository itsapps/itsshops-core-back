import { CouponIcon } from '../../../assets/icons'
import { ITSSchemaDefinition } from '../../../types'

/**
 * Snapshot of one discount applied to an order (`appliedDiscounts[]`), written by core-front's
 * checkout, never recomputed. `amount` = cents saved (shipping: the waived shipping cost). The
 * per-line allocation is on `orderItem.discount` / `orderItemBundleItem.discount`.
 */
export const appliedDiscount: ITSSchemaDefinition = {
  name: 'appliedDiscount',
  type: 'object',
  icon: CouponIcon,
  feature: 'shop.discounts',
  build: (ctx) => {
    const { f } = ctx
    const readOnly = !ctx.config.isDev
    return {
      fields: [
        // Weak: deleting a discount never breaks an order. Unset on migrated entries that had no
        // discount document ("Versandkostenfrei durch Produkt").
        f('discountRef', 'reference', { to: [{ type: 'discount' }], weak: true, readOnly }),
        f('code', 'string', { readOnly }),
        // In the order's locale, at order time.
        f('title', 'string', { readOnly }),
        f('trigger', 'string', {
          options: { list: [{ value: 'code' }, { value: 'automatic' }] },
          validation: (rule) => rule.required(),
          readOnly,
        }),
        f('target', 'string', {
          options: { list: [{ value: 'items' }, { value: 'order' }, { value: 'shipping' }] },
          validation: (rule) => rule.required(),
          readOnly,
        }),
        f('valueType', 'string', {
          options: { list: [{ value: 'percent' }, { value: 'fixed' }, { value: 'free' }] },
          readOnly,
        }),
        f('value', 'number', {
          hidden: ({ parent }) =>
            (parent as { valueType?: string } | undefined)?.valueType === 'free',
          readOnly,
        }),
        f('amount', 'number', { validation: (rule) => rule.min(0).integer(), readOnly }),
      ],
      preview: {
        select: {
          title: 'title',
          code: 'code',
          target: 'target',
          valueType: 'valueType',
          value: 'value',
          amount: 'amount',
        },
        prepare(data) {
          const { title, code, target, valueType, value, amount } = data as {
            title?: string
            code?: string
            target?: string
            valueType?: string
            value?: number
            amount?: number
          }
          let valueLabel = ''
          if (target === 'shipping' || valueType === 'free') valueLabel = '🚚'
          else if (valueType === 'percent') valueLabel = `${value ?? 0} %`
          else if (valueType === 'fixed' && typeof value === 'number')
            valueLabel = ctx.format.currency(value / 100)
          const saved = typeof amount === 'number' ? ctx.format.currency(amount / 100) : ''
          return {
            title:
              [title, code && code !== title ? `(${code})` : ''].filter(Boolean).join(' ') || '—',
            subtitle: [valueLabel, saved].filter(Boolean).join(' · '),
            media: CouponIcon,
          }
        },
      },
    }
  },
}
