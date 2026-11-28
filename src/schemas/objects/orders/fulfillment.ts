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
    // Only trackingCode is intentionally writable so admins can add it after dispatch.
    const lockSnapshot = !ctx.config.isDev
    const hiddenUnlessPickup = ({ parent }: { parent?: { methodType?: string } }) =>
      parent?.methodType !== 'pickup'

    const fields = [
      f('trackingCode', 'string', {
        hidden: ({ parent }) => parent?.methodType === 'pickup',
      }),
      // Pickup snapshot (copied from the pickup method at order time, city and
      // instructions in the customer's locale), so a later change on the method
      // doesn't move existing orders or deadlines.
      f('pickupAddress', 'object', {
        fields: [
          f('line1', 'string'),
          f('line2', 'string'),
          f('zip', 'string'),
          f('city', 'string'),
          f('country', 'string'),
        ],
        readOnly: lockSnapshot,
        hidden: hiddenUnlessPickup,
      }),
      f('pickupInstructions', 'text', { readOnly: lockSnapshot, hidden: hiddenUnlessPickup }),
      f('pickupHoldDays', 'number', { readOnly: lockSnapshot, hidden: hiddenUnlessPickup }),
      f('pickupAnnounceReady', 'boolean', { readOnly: lockSnapshot, hidden: hiddenUnlessPickup }),

      f('methodTitle', 'string', { hidden: lockSnapshot }),
      // Snapshot of the method's delivery time at order time (shown in the confirmation).
      f('deliveryTime', 'string', { readOnly: lockSnapshot }),
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
      // Why a delivery method cost 0 (set only then): threshold > discount (the shipping entry in
      // `appliedDiscounts`).
      f('freeShippingReason', 'string', {
        options: {
          list: [
            { value: 'threshold' },
            { value: 'discount' },
          ],
        },
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
