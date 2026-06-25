import { FulfillmentIcon } from '../../../assets/icons'
import { ITSSchemaDefinition } from '../../../types'

export const fulfillment: ITSSchemaDefinition = {
  name: 'fulfillment',
  type: 'object',
  feature: 'shop',
  icon: FulfillmentIcon,
  build: (ctx) => {
    const { f } = ctx

    // Snapshotted fields (taken at order time) are read-only outside dev.
    // trackingCode and pickupLocation are intentionally writable so admins can
    // add them after dispatch / pickup.
    const lockSnapshot = !ctx.config.isDev

    const fields = [
      f('trackingCode', 'string', {
        hidden: ({ parent }) => parent?.methodType === 'pickup',
      }),
      f('pickupLocation', 'string', {
        hidden: ({ parent }) => parent?.methodType !== 'pickup',
      }),

      f('methodTitle', 'string', { hidden: lockSnapshot }),
      f('methodType', 'string', {
        options: { list: [{ value: 'delivery' }, { value: 'pickup' }] },
        validation: (Rule) => Rule.required(),
        hidden: lockSnapshot,
      }),

      // 2. Financials: What was the cost and tax for this specific service?
      f('shippingCost', 'number', {
        validation: (rule) => rule.required().min(0).integer(),
        hidden: lockSnapshot,
      }),

      // This handles the tax on the shipping fee itself
      f('taxSnapshot', 'vatBreakdownItem', { hidden: lockSnapshot }),
      f('packagingLines', 'array', {
        of: [{ type: 'fulfillmentPackagingLine' }],
        hidden: lockSnapshot,
      }),

      // 3. Tracking & References
      f('method', 'reference', {
        to: [{ type: 'shippingMethod' }],
        weak: true,
        hidden: lockSnapshot,
      }),
    ]

    return { fields }
  },
}
