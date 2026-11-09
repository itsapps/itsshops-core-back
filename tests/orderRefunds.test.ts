import { describe, expect, it } from 'vitest'

import { refundedTotal, remainingAmount } from '../src/utils/orderRefunds'

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
