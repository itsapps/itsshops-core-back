import { CouponIcon } from '../../../assets/icons'
import { ITSSchemaDefinition } from '../../../types'

export const appliedCoupon: ITSSchemaDefinition = {
  name: 'appliedCoupon',
  type: 'object',
  icon: CouponIcon,
  feature: 'shop.coupons',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('couponRef', 'reference', {
          to: [{ type: 'coupon' }],
        }),
        f('code', 'string', {
          validation: (rule) => rule.required(),
        }),
        f('discountType', 'string', {
          options: {
            list: [{ value: 'percent' }, { value: 'fixed' }, { value: 'freeShipping' }],
            layout: 'radio',
          },
          validation: (rule) => rule.required(),
        }),
        f('value', 'number', {
          hidden: ({ parent }) =>
            (parent as { discountType?: string } | undefined)?.discountType === 'freeShipping',
        }),
        f('discountAmount', 'number', {
          validation: (rule) => rule.required().min(0),
        }),
      ],
      preview: {
        select: {
          code: 'code',
          discountType: 'discountType',
          value: 'value',
          discountAmount: 'discountAmount',
        },
        prepare(data) {
          const { code, discountType, value, discountAmount } = data as {
            code?: string
            discountType?: 'percent' | 'fixed' | 'freeShipping'
            value?: number
            discountAmount?: number
          }
          let valueLabel = ''
          if (discountType === 'percent') valueLabel = `${value ?? 0}%`
          else if (discountType === 'fixed' && typeof value === 'number')
            valueLabel = ctx.format.currency(value / 100)
          else if (discountType === 'freeShipping') valueLabel = '🚚'

          const deducted =
            typeof discountAmount === 'number' ? ctx.format.currency(discountAmount / 100) : ''

          return {
            title: code ?? '—',
            subtitle: [valueLabel, deducted].filter(Boolean).join(' · '),
            media: CouponIcon,
          }
        },
      },
    }
  },
}
