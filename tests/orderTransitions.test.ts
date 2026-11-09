import { describe, expect, it } from 'vitest'

import { getAllowedPaymentTransitions } from '../src/utils/orderTransitions'

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
