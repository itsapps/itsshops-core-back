import { CouponIcon } from '../../assets/icons'
import { DiscountValueInput } from '../../components/DiscountValueInput'
import { ITSDocumentDefinition } from '../../types'
import { ProductSelectorValue } from '../objects/productSelector'

type Trigger = 'code' | 'automatic'
type Target = 'items' | 'order' | 'shipping'
type ValueType = 'percent' | 'fixed' | 'free'

interface DiscountDoc {
  appliesTo?: ProductSelectorValue
  minSubtotal?: number
  minQuantity?: number
}

interface DiscountParent {
  trigger?: Trigger
  target?: Target
  valueType?: ValueType
  minSubtotal?: number
}

/**
 * One discount: a code the customer types (`trigger: code`, `shop.coupons`) or a rule checkout
 * applies by itself (`trigger: automatic`, `shop.automaticDiscounts`), on items, the order or the
 * shipping. Evaluated by core-front's discount pipeline (`src/shared/discounts/`); semantics in
 * core-front `commerce-and-netlify.md` → Discounts. Not `liveEdit`: checkout reads published only.
 */
export const discount: ITSDocumentDefinition = {
  name: 'discount',
  type: 'document',
  icon: CouponIcon,
  feature: 'shop.discounts',
  build: (ctx) => {
    const { f, t } = ctx
    const isOn = ctx.featureRegistry.isFeatureEnabled
    const triggers: Trigger[] = [
      ...(isOn('shop.coupons') ? (['code'] as const) : []),
      ...(isOn('shop.automaticDiscounts') ? (['automatic'] as const) : []),
    ]
    const vt = (key: string, fallback: string) => t.default(`discount.validation.${key}`, fallback)
    const isShipping = (parent: unknown) => (parent as DiscountParent)?.target === 'shipping'
    const isCode = (parent: unknown) => (parent as DiscountParent)?.trigger === 'code'

    const grouped = ctx.builders.buildGroupedSchema([
      {
        name: 'general',
        fields: [
          // The only customer-facing label of an automatic discount (checkout, mails, order).
          f('title', 'i18nString', { i18n: 'atLeastOne' }),
          f('description', 'i18nText'),
          f('enabled', 'boolean', { initialValue: true }),
          f('trigger', 'string', {
            options: { list: triggers.map((value) => ({ value })), layout: 'radio' },
            initialValue: triggers[0],
            hidden: triggers.length < 2,
            validation: (Rule) => [
              Rule.required(),
              // Checkout reads published discounts at once: an automatic one without any
              // condition gives every customer the discount from the moment it's published.
              Rule.custom((value, context) => {
                const doc = context.document as DiscountDoc | undefined
                if (value !== 'automatic' || !doc) return true
                const include = doc.appliesTo?.include
                const narrowed =
                  !!include &&
                  (['kinds', 'categories', 'manufacturers', 'products', 'variants'] as const).some(
                    (key) => (include[key]?.length ?? 0) > 0,
                  )
                return narrowed || include?.hasCompareAtPrice || doc.minSubtotal || doc.minQuantity
                  ? true
                  : vt(
                      'automaticEveryOrder',
                      'Applies to every order — no product selection or minimum set',
                    )
              }).warning(),
            ],
          }),
          f('code', 'string', {
            hidden: ({ parent }) => !isCode(parent),
            validation: (Rule) =>
              Rule.custom(async (value, context) => {
                if (!isCode(context.parent)) return true
                if (typeof value !== 'string' || !value)
                  return vt('codeRequired', 'Code is required')
                if (!/^[a-zA-Z0-9_-]+$/.test(value))
                  return vt('codeFormat', 'Letters, digits, - and _ only')
                const id = context.document?._id?.replace(/^drafts\./, '') ?? ''
                const client = context.getClient({ apiVersion: ctx.config.apiVersion })
                const matches = await client.fetch<number>(
                  // Case-insensitive, as checkout matches codes (core-front `CHECKOUT_QUERY`).
                  `count(*[_type == "discount" && lower(code) == lower($code) && !(_id in [$draft, $published])])`,
                  { code: value, draft: `drafts.${id}`, published: id },
                )
                return matches === 0 ? true : vt('codeInUse', 'Code is already in use')
              }),
          }),
          f('redemptionCount', 'number', { readOnly: true, initialValue: 0 }),
        ],
      },
      {
        name: 'discountValue',
        fields: [
          f('target', 'string', {
            options: {
              list: [{ value: 'items' }, { value: 'order' }, { value: 'shipping' }],
              layout: 'radio',
            },
            initialValue: 'order',
            validation: (Rule) => Rule.required(),
          }),
          f('valueType', 'string', {
            options: {
              list: [{ value: 'percent' }, { value: 'fixed' }, { value: 'free' }],
              layout: 'radio',
            },
            initialValue: 'percent',
            validation: (Rule) =>
              Rule.required().custom((value, context) => {
                const shipping = isShipping(context.parent)
                if (shipping && value !== 'free')
                  return vt('shippingOnlyFree', 'Shipping discounts can only be "free"')
                if (!shipping && value === 'free')
                  return vt('freeOnlyShipping', '"Free" is only for shipping discounts')
                return true
              }),
          }),
          f('value', 'number', {
            hidden: ({ parent }) =>
              isShipping(parent) || (parent as DiscountParent)?.valueType === 'free',
            components: { input: DiscountValueInput },
            validation: (Rule) => [
              Rule.custom((value, context) => {
                const parent = context.parent as DiscountParent | undefined
                if (isShipping(parent) || parent?.valueType === 'free') return true
                if (typeof value !== 'number') return vt('valueRequired', 'Value is required')
                if (value <= 0) return vt('valuePositive', 'Value must be positive')
                if (parent?.valueType === 'percent' && value > 100)
                  return vt('percentMax', 'Percent cannot exceed 100')
                if (parent?.valueType === 'fixed' && !Number.isInteger(value))
                  return vt('fixedCents', 'Fixed amounts are whole cents')
                return true
              }),
              // Stripe can't charge below €0.50: an order that ends up free can't be paid.
              Rule.custom((value, context) => {
                const parent = context.parent as DiscountParent | undefined
                return parent?.valueType === 'percent' && value === 100
                  ? vt(
                      'percentFull',
                      '100 % makes the order free — checkout cannot take payments below €0.50',
                    )
                  : true
              }).warning(),
            ],
          }),
          f('appliesTo', 'productSelector', {
            validation: (Rule) =>
              Rule.custom((value) => {
                // core-front still evaluates a criterion whose feature was turned off later.
                const sides = [
                  (value as ProductSelectorValue | undefined)?.include,
                  (value as ProductSelectorValue | undefined)?.exclude,
                ]
                const uses = (key: 'categories' | 'manufacturers') =>
                  sides.some((side) => (side?.[key]?.length ?? 0) > 0)
                if (uses('categories') && !isOn('shop.category'))
                  return vt(
                    'categoryCriterionOff',
                    'Category criterion is disabled but still evaluated',
                  )
                if (uses('manufacturers') && !isOn('shop.manufacturer'))
                  return vt(
                    'manufacturerCriterionOff',
                    'Manufacturer criterion is disabled but still evaluated',
                  )
                return true
              }).warning(),
          }),
          f('ignoreShopExclusions', 'boolean', {
            initialValue: false,
            hidden: ({ parent }) => isShipping(parent),
          }),
          // Unset = default by trigger (code: yes, as a free-shipping code always waived the
          // pickup fee; automatic: no). core-front applies the same default.
          f('appliesToPickup', 'boolean', {
            hidden: ({ parent }) => !isShipping(parent),
          }),
        ],
      },
      {
        name: 'conditions',
        fields: [
          ctx.builders.priceField({
            name: 'minSubtotal',
            validation: (Rule) => Rule.integer().positive(),
          }),
          f('minSubtotalBasis', 'string', {
            options: { list: [{ value: 'wholeCart' }, { value: 'matching' }], layout: 'radio' },
            initialValue: 'wholeCart',
            hidden: ({ parent }) => !(parent as DiscountParent)?.minSubtotal,
          }),
          f('minQuantity', 'number', { validation: (Rule) => Rule.integer().positive() }),
          f('validFrom', 'datetime', { options: ctx.format.dateFormat('datetime') }),
          f('validTo', 'datetime', {
            options: ctx.format.dateFormat('datetime'),
            validation: (Rule) =>
              Rule.custom((value, context) => {
                const parent = context.parent as { validFrom?: string } | undefined
                if (typeof value !== 'string' || !parent?.validFrom) return true
                return new Date(value) <= new Date(parent.validFrom)
                  ? vt('validToAfterFrom', 'validTo must be after validFrom')
                  : true
              }),
          }),
          f('maxRedemptions', 'number', { validation: (Rule) => Rule.integer().positive() }),
          // Needs the customer's email — only a code discount is checked per email.
          f('maxPerEmail', 'number', {
            hidden: ({ parent, value }) =>
              !isCode(parent) && (value === undefined || value === null),
            validation: (Rule) =>
              Rule.integer()
                .positive()
                .custom((value, context) =>
                  typeof value === 'number' && !isCode(context.parent)
                    ? vt('maxPerEmailCodeOnly', 'Only for discount codes')
                    : true,
                ),
          }),
        ],
      },
      {
        name: 'combinations',
        fields: [
          // A and B stack only if each one's `combinesWith` contains the other's target.
          f('combinesWith', 'object', {
            fields: [
              f('items', 'boolean', { initialValue: false }),
              f('order', 'boolean', { initialValue: false }),
              f('shipping', 'boolean', { initialValue: true }),
            ],
            options: { columns: 3 },
          }),
        ],
      },
    ])

    return {
      ...grouped,
      preview: {
        select: {
          title: 'title',
          code: 'code',
          trigger: 'trigger',
          target: 'target',
          valueType: 'valueType',
          value: 'value',
          enabled: 'enabled',
          redemptionCount: 'redemptionCount',
          maxRedemptions: 'maxRedemptions',
          validFrom: 'validFrom',
          validTo: 'validTo',
        },
        prepare(data) {
          const d = data as {
            title?: unknown
            code?: string
            trigger?: Trigger
            target?: Target
            valueType?: ValueType
            value?: number
            enabled?: boolean
            redemptionCount?: number
            maxRedemptions?: number
            validFrom?: string
            validTo?: string
          }
          const now = new Date()
          const pt = (key: string, fallback: string) =>
            t.default(`discount.preview.${key}`, fallback)
          let badge: string
          if (!d.enabled) badge = pt('badge.disabled', 'Disabled')
          else if (d.validTo && new Date(d.validTo) < now) badge = pt('badge.expired', 'Expired')
          else if (d.validFrom && new Date(d.validFrom) > now)
            badge = pt('badge.scheduled', 'Scheduled')
          else if (
            typeof d.maxRedemptions === 'number' &&
            (d.redemptionCount ?? 0) >= d.maxRedemptions
          )
            badge = pt('badge.exhausted', 'Exhausted')
          else badge = pt('badge.active', 'Active')

          let valueLabel = ''
          if (d.target === 'shipping' || d.valueType === 'free')
            valueLabel = pt('freeShipping', 'Free shipping')
          else if (d.valueType === 'percent') valueLabel = `${d.value ?? 0} %`
          else if (d.valueType === 'fixed' && typeof d.value === 'number')
            valueLabel = ctx.format.currency(d.value / 100)
          const targetLabel =
            d.target && d.target !== 'shipping'
              ? t.default(`discount.fields.target.options.${d.target}`, d.target)
              : ''
          const triggerLabel =
            d.trigger === 'code'
              ? (d.code ?? '—')
              : t.default('discount.fields.trigger.options.automatic', 'Automatic')

          const title = ctx.localizer.value(d.title as never)

          return {
            title: title || (d.code ?? '—'),
            // Status first: a long title/code would truncate it at the end of the line.
            subtitle: [badge, triggerLabel, [valueLabel, targetLabel].filter(Boolean).join(' ')]
              .filter(Boolean)
              .join(' · '),
            media: CouponIcon,
          }
        },
      },
    }
  },
}
