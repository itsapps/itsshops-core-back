import { CouponIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const coupon: ITSDocumentDefinition = {
  name: 'coupon',
  type: 'document',
  icon: CouponIcon,
  feature: 'shop.coupons',
  build: (ctx) => {
    const { f, t } = ctx
    return {
      fields: [
        f('code', 'string', {
          validation: (Rule) =>
            Rule.required()
              .regex(/^[a-zA-Z0-9_-]+$/, {
                name: 'code',
                invert: false,
              })
              .custom(async (value, context) => {
                if (typeof value !== 'string' || !value) return true
                const id = context.document?._id?.replace(/^drafts\./, '') ?? ''
                const client = context.getClient({ apiVersion: ctx.config.apiVersion })
                const matches = await client.fetch<number>(
                  `count(*[_type == "coupon" && code == $code && !(_id in [$draft, $published])])`,
                  { code: value, draft: `drafts.${id}`, published: id },
                )
                return matches === 0
                  ? true
                  : t.default('coupon.validation.codeInUse', 'Code is already in use')
              }),
        }),
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('description', 'i18nText'),
        f('enabled', 'boolean', { initialValue: true }),
        f('discountType', 'string', {
          options: {
            list: [{ value: 'percent' }, { value: 'fixed' }, { value: 'freeShipping' }],
            layout: 'radio',
          },
          initialValue: 'percent',
          validation: (Rule) => Rule.required(),
        }),
        f('value', 'number', {
          hidden: ({ parent }) => parent?.discountType === 'freeShipping',
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as { discountType?: string } | undefined
              if (parent?.discountType === 'freeShipping') return true
              if (typeof value !== 'number')
                return t.default('coupon.validation.valueRequired', 'Value is required')
              if (value <= 0)
                return t.default('coupon.validation.valuePositive', 'Value must be positive')
              if (parent?.discountType === 'percent' && value > 100) {
                return t.default('coupon.validation.percentMax', 'Percent cannot exceed 100')
              }
              return true
            }),
        }),
        f('validFrom', 'datetime', {
          options: ctx.format.dateFormat('datetime'),
        }),
        f('validTo', 'datetime', {
          options: ctx.format.dateFormat('datetime'),
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as { validFrom?: string } | undefined
              if (typeof value !== 'string' || !parent?.validFrom) return true
              if (new Date(value) <= new Date(parent.validFrom)) {
                return t.default(
                  'coupon.validation.validToAfterFrom',
                  'validTo must be after validFrom',
                )
              }
              return true
            }),
        }),
        ctx.builders.priceField({
          name: 'minSubtotal',
          validation: (Rule) => Rule.integer().positive(),
        }),
        f('maxRedemptions', 'number', {
          validation: (Rule) => Rule.integer().positive(),
        }),
        f('redemptionCount', 'number', {
          readOnly: true,
          initialValue: 0,
        }),
      ],
      preview: {
        select: {
          code: 'code',
          discountType: 'discountType',
          value: 'value',
          enabled: 'enabled',
          redemptionCount: 'redemptionCount',
          maxRedemptions: 'maxRedemptions',
          validFrom: 'validFrom',
          validTo: 'validTo',
        },
        prepare(data) {
          const {
            code,
            discountType,
            value,
            enabled,
            redemptionCount,
            maxRedemptions,
            validFrom,
            validTo,
          } = data as {
            code?: string
            discountType?: 'percent' | 'fixed' | 'freeShipping'
            value?: number
            enabled?: boolean
            redemptionCount?: number
            maxRedemptions?: number
            validFrom?: string
            validTo?: string
          }
          const now = new Date()
          const expired = validTo ? new Date(validTo) < now : false
          const notYet = validFrom ? new Date(validFrom) > now : false
          const exhausted =
            typeof maxRedemptions === 'number' &&
            typeof redemptionCount === 'number' &&
            redemptionCount >= maxRedemptions

          let badge = ''
          if (!enabled) badge = t.default('coupon.preview.badge.disabled', 'Disabled')
          else if (expired) badge = t.default('coupon.preview.badge.expired', 'Expired')
          else if (notYet) badge = t.default('coupon.preview.badge.scheduled', 'Scheduled')
          else if (exhausted) badge = t.default('coupon.preview.badge.exhausted', 'Exhausted')
          else badge = t.default('coupon.preview.badge.active', 'Active')

          let valueLabel = ''
          if (discountType === 'percent') valueLabel = `${value ?? 0}%`
          else if (discountType === 'fixed')
            valueLabel = value ? ctx.format.currency(value / 100) : ''
          else if (discountType === 'freeShipping')
            valueLabel = t.default('coupon.preview.freeShipping', 'Free Shipping')

          return {
            title: code ?? '-',
            subtitle: [valueLabel, badge].filter(Boolean).join(' · '),
            media: CouponIcon,
          }
        },
      },
    }
  },
}
