import { describe, expect, it } from 'vitest'

import {
  refundedTotal,
  refundMailBlocked,
  refundMailOffered,
  remainingAmount,
} from '../src/utils/orderRefunds'

describe('refundedTotal / remainingAmount', () => {
  it('no refunds → nothing refunded, remaining = grand total', () => {
    expect(refundedTotal(undefined)).toBe(0)
    expect(remainingAmount(5000, undefined)).toBe(5000)
    expect(remainingAmount(5000, [])).toBe(5000)
  })

  it('counts pending and succeeded, skips failed and canceled', () => {
    const refunds = [
      { amount: 1000, status: 'succeeded' },
      { amount: 500, status: 'pending' },
      { amount: 700, status: 'failed' },
      { amount: 300, status: 'canceled' },
      { amount: 200 },
    ]
    expect(refundedTotal(refunds)).toBe(1700)
    expect(remainingAmount(5000, refunds)).toBe(3300)
  })

  it('refunds above the total → remaining 0', () => {
    expect(remainingAmount(1000, [{ amount: 1500, status: 'succeeded' }])).toBe(0)
  })
})

describe('refund mails in "Send mail"', () => {
  it('offers the partial mail once refunded, the full mail only when refunded', () => {
    expect(refundMailOffered('orderRefundedPartially', 'succeeded')).toBe(false)
    expect(refundMailOffered('orderRefundedPartially', 'partiallyRefunded')).toBe(true)
    expect(refundMailOffered('orderRefundedPartially', 'refunded')).toBe(true)
    expect(refundMailOffered('orderRefunded', 'succeeded')).toBe(false)
    expect(refundMailOffered('orderRefunded', 'partiallyRefunded')).toBe(false)
    expect(refundMailOffered('orderRefunded', 'refunded')).toBe(true)
  })

  it('partial mail needs a counted stored refund', () => {
    expect(refundMailBlocked('orderRefundedPartially', 3000, undefined)).toBe('noStoredRefund')
    expect(
      refundMailBlocked('orderRefundedPartially', 3000, [{ amount: 500, status: 'failed' }]),
    ).toBe('noStoredRefund')
    expect(
      refundMailBlocked('orderRefundedPartially', 3000, [{ amount: 500, status: 'succeeded' }]),
    ).toBe(undefined)
  })

  it('full mail is blocked while stored refunds do not cover the total; none stored → allowed', () => {
    expect(refundMailBlocked('orderRefunded', 3000, undefined)).toBe(undefined)
    expect(refundMailBlocked('orderRefunded', 3000, [{ amount: 1000, status: 'succeeded' }])).toBe(
      'notFullyRefunded',
    )
    expect(
      refundMailBlocked('orderRefunded', 3000, [
        { amount: 1000, status: 'succeeded' },
        { amount: 2000, status: 'succeeded' },
      ]),
    ).toBe(undefined)
  })
})
