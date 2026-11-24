import { describe, expect, it, vi } from 'vitest'

import { refundOrder } from '../src/lib/shop/orderRefund'
import { buildRefundPatch } from '../src/utils/orderRefunds'
import {
  getAllowedFulfillmentTransitions,
  mailTypeLabelKey,
  refundCancelsFulfillment,
  statusLabelKey,
} from '../src/utils/orderTransitions'
import { pickupDeadline, pickupOverdue } from '../src/utils/pickup'
import { requiredSubfields } from '../src/utils/validation'
import { returnedOffered, withdrawalNextStep } from '../src/utils/withdrawals'

const local = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min)

describe('pickup: shipped = ready for pickup, not handed over', () => {
  it('pickup shipped → delivered | canceled (not returned)', () => {
    expect(getAllowedFulfillmentTransitions('shipped', 'succeeded', 'pickup')).toEqual([
      'delivered',
      'canceled',
    ])
    expect(getAllowedFulfillmentTransitions('shipped', 'partiallyRefunded', 'pickup')).toEqual([
      'delivered',
      'canceled',
    ])
    // delivery unchanged
    expect(getAllowedFulfillmentTransitions('shipped', 'succeeded', 'delivery')).toEqual([
      'delivered',
      'returned',
    ])
    expect(getAllowedFulfillmentTransitions('shipped', 'succeeded')).toEqual([
      'delivered',
      'returned',
    ])
  })

  it('refunded pickup: shipped allows nothing, collected (delivered) → returned', () => {
    expect(getAllowedFulfillmentTransitions('shipped', 'refunded', 'pickup')).toEqual([])
    expect(getAllowedFulfillmentTransitions('delivered', 'refunded', 'pickup')).toEqual([
      'returned',
    ])
    expect(getAllowedFulfillmentTransitions('shipped', 'refunded', 'delivery')).toEqual([
      'returned',
    ])
  })

  it('a full refund cancels an uncollected pickup order', () => {
    expect(refundCancelsFulfillment('shipped', 'pickup')).toBe(true)
    expect(refundCancelsFulfillment('shipped', 'delivery')).toBe(false)
    expect(refundCancelsFulfillment('delivered', 'pickup')).toBe(false)
    expect(refundCancelsFulfillment('processing')).toBe(true)
  })

  it('buildRefundPatch: full refund of pickup shipped → canceled', () => {
    const patch = buildRefundPatch(
      { status: 'shipped', fulfillment: { methodType: 'pickup' } },
      { refund: 'full', timestamp: '2026-11-19T10:00:00Z', newKey: () => 'k' },
    )
    expect(patch.set).toEqual({ paymentStatus: 'refunded', status: 'canceled' })
  })

  it('returnedOffered: not for an uncollected pickup order', () => {
    expect(returnedOffered('shipped', 'refunded', 'pickup')).toBe(false)
    expect(returnedOffered('delivered', 'refunded', 'pickup')).toBe(true)
    expect(returnedOffered('shipped', 'refunded', 'delivery')).toBe(true)
  })

  it('withdrawalNextStep: pickup shipped → refund / notCollected', () => {
    const w = { status: 'received', declaredAt: local(2026, 11, 1, 10).toISOString() }
    const order = { status: 'shipped', paymentStatus: 'succeeded', grandTotal: 1000 }
    expect(
      withdrawalNextStep(w, { ...order, methodType: 'pickup' }, local(2026, 11, 2)),
    ).toMatchObject({ step: 'refund', why: 'notCollected' })
    expect(withdrawalNextStep(w, order, local(2026, 11, 2)).step).toBe('wait')
  })

  it('refundOrder with a ResolveOrder-shaped order (nested fulfillment) cancels', async () => {
    const commit = vi.fn().mockResolvedValue({})
    const append = vi.fn(() => ({ commit }))
    const set = vi.fn(() => ({ append }))
    const sanityClient = {
      fetch: vi.fn().mockResolvedValue({ paymentStatus: 'succeeded', refunds: [] }),
      patch: vi.fn(() => ({ set })),
    }
    const frontendClient = {
      refundPayment: vi.fn().mockResolvedValue({ data: { amount: 5000 } }),
    }
    const result = await refundOrder({
      sanityClient: sanityClient as never,
      frontendClient,
      order: { _id: 'o1', status: 'shipped', fulfillment: { methodType: 'pickup' } },
      expected: { paymentStatus: 'succeeded', refundedCents: 0 },
      refund: 'full',
      newKey: () => 'k',
      now: () => new Date('2026-11-19T10:00:00Z'),
    })
    expect(result.ok).toBe(true)
    expect(set).toHaveBeenCalledWith({ paymentStatus: 'refunded', status: 'canceled' })
  })
})

describe('pickup labels', () => {
  it('status labels', () => {
    expect(statusLabelKey('shipped', 'pickup')).toBe('order.status.pickupOptions.shipped')
    expect(statusLabelKey('delivered', 'pickup')).toBe('order.status.pickupOptions.delivered')
    expect(statusLabelKey('canceled', 'pickup')).toBe('order.status.options.canceled')
    expect(statusLabelKey('shipped', 'delivery')).toBe('order.status.options.shipped')
  })
  it('mail type labels', () => {
    expect(mailTypeLabelKey('orderShipping', 'pickup')).toBe(
      'actions.order.pickupMailTypes.orderShipping',
    )
    expect(mailTypeLabelKey('orderShipping')).toBe('actions.order.mailTypes.orderShipping')
    expect(mailTypeLabelKey('orderCanceled', 'pickup')).toBe(
      'actions.order.mailTypes.orderCanceled',
    )
  })
})

// Same table as core-front `src/shared/__tests__/pickup.test.ts`.
describe('pickupDeadline', () => {
  const shipped = (ts: string) => ({ type: 'fulfillment', status: 'shipped', timestamp: ts })
  it('latest shipped entry + hold days', () => {
    const history = [
      shipped(local(2026, 11, 10, 9).toISOString()),
      { type: 'mail', status: 'orderShipping', timestamp: local(2026, 11, 20).toISOString() },
      shipped(local(2026, 11, 18, 9).toISOString()),
    ]
    expect(pickupDeadline(history, 7)).toEqual(local(2026, 11, 25))
  })
  it('counts by the local calendar date', () => {
    expect(pickupDeadline([shipped(local(2026, 11, 18, 23, 30).toISOString())], 7)).toEqual(
      local(2026, 11, 25),
    )
  })
  it('no shipped entry or no hold days → null', () => {
    expect(pickupDeadline([], 7)).toBeNull()
    expect(pickupDeadline(undefined, 7)).toBeNull()
    expect(pickupDeadline([shipped(local(2026, 11, 18).toISOString())], undefined)).toBeNull()
  })
  it('overdue only after the deadline day', () => {
    const d = local(2026, 11, 25)
    expect(pickupOverdue(d, local(2026, 11, 25, 22))).toBe(false)
    expect(pickupOverdue(d, local(2026, 11, 26, 1))).toBe(true)
  })
})

describe('requiredSubfields `when`', () => {
  // A minimal Rule stand-in: captures the custom validator.
  const run = (when: boolean, value: unknown) => {
    let validator: (v: unknown, c: unknown) => unknown = () => true
    const rule = {
      custom(fn: typeof validator) {
        validator = fn
        return { error: () => rule, warning: () => rule }
      },
    }
    requiredSubfields(['line1', 'zip'], (k: string) => k, { when: () => when })(rule as never)
    return validator(value, {})
  }
  it('when false → valid with an empty value', () => {
    expect(run(false, undefined)).toBe(true)
  })
  it('when true → missing subfields reported', () => {
    expect(run(true, { line1: 'x' })).toEqual([
      { message: 'validation.requiredField', path: ['zip'] },
    ])
  })
})
