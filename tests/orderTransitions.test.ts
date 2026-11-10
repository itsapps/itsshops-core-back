import { describe, expect, it } from 'vitest'

import {
  getAllowedFulfillmentTransitions,
  getAllowedPaymentTransitions,
} from '../src/utils/orderTransitions'

describe('payment transitions', () => {
  it('succeeded → refunded | partiallyRefunded', () => {
    expect(getAllowedPaymentTransitions('succeeded')).toEqual(['refunded', 'partiallyRefunded'])
  })

  it('a partially refunded order can be refunded partially again or in full', () => {
    expect(getAllowedPaymentTransitions('partiallyRefunded')).toEqual([
      'refunded',
      'partiallyRefunded',
    ])
  })

  it('refunded is terminal', () => {
    expect(getAllowedPaymentTransitions('refunded')).toEqual([])
  })
})

describe('fulfillment transitions', () => {
  it('delivered → returned, whatever the payment status', () => {
    for (const p of ['succeeded', 'partiallyRefunded', 'refunded'] as const) {
      expect(getAllowedFulfillmentTransitions('delivered', p)).toEqual(['returned'])
    }
  })

  it('shipped → delivered | returned; refunded → returned only', () => {
    expect(getAllowedFulfillmentTransitions('shipped', 'succeeded')).toEqual([
      'delivered',
      'returned',
    ])
    expect(getAllowedFulfillmentTransitions('shipped', 'refunded')).toEqual(['returned'])
  })

  it('returned and canceled are terminal', () => {
    for (const p of ['succeeded', 'partiallyRefunded', 'refunded'] as const) {
      expect(getAllowedFulfillmentTransitions('returned', p)).toEqual([])
      expect(getAllowedFulfillmentTransitions('canceled', p)).toEqual([])
    }
  })
})
