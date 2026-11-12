import { describe, expect, it, vi } from 'vitest'

import { refundOrder } from '../src/lib/shop/orderRefund'
import {
  localDatePlus,
  resolveOptions,
  returnedOffered,
  withdrawalActionsFor,
  withdrawalDeadline,
  withdrawalNextStep,
} from '../src/utils/withdrawals'

// Local dates: build `declaredAt` from local wall-clock so the tests hold in any timezone.
const local = (y: number, m: number, d: number, h = 12, min = 0) => new Date(y, m - 1, d, h, min)
const declared = local(2026, 11, 1, 10).toISOString()
const day = (n: number) => local(2026, 11, 1 + n, 9)

describe('withdrawalDeadline', () => {
  it('due 14 days after the declaration date; caution from 3 days before; overdue after', () => {
    expect(withdrawalDeadline(declared, day(10))).toEqual({
      dueDate: local(2026, 11, 15, 0),
      tone: 'default',
    })
    expect(withdrawalDeadline(declared, day(11)).tone).toBe('caution')
    const d14 = withdrawalDeadline(declared, day(14))
    expect(d14.tone).toBe('caution')
    expect(d14.overdueSince).toBeUndefined()
    expect(withdrawalDeadline(declared, day(15))).toEqual({
      dueDate: local(2026, 11, 15, 0),
      tone: 'critical',
      overdueSince: local(2026, 11, 16, 0),
    })
  })

  it('counts by the local calendar date, not the UTC one', () => {
    // 23:30 local is the next day in UTC for every timezone east of UTC.
    const lateEvening = local(2026, 11, 1, 23, 30).toISOString()
    expect(withdrawalDeadline(lateEvening, day(10)).dueDate).toEqual(local(2026, 11, 15, 0))
    expect(localDatePlus(lateEvening)).toEqual(local(2026, 11, 1, 0))
  })
})

describe('withdrawalNextStep', () => {
  const open = { status: 'received', declaredAt: declared }
  const today = day(2)
  const order = (status: string, paymentStatus: string, refunds?: object[]) => ({
    status,
    paymentStatus,
    grandTotal: 10000,
    refunds: refunds as never,
  })

  it('unmatched → assign (delete by declaredAt + 30 days), refund deadline already running', () => {
    expect(withdrawalNextStep({ status: 'unmatched', declaredAt: declared }, null, today)).toEqual({
      step: 'assign',
      assignBy: local(2026, 12, 1, 0),
      deadline: { dueDate: local(2026, 11, 15, 0), tone: 'default' },
    })
  })

  it('open + order already refunded → close', () => {
    const r = withdrawalNextStep(open, order('shipped', 'refunded'), today)
    expect(r.step).toBe('close')
    expect(r.deadline?.dueDate).toEqual(local(2026, 11, 15, 0))
  })

  it('open + undispatched → refund (not shipped)', () => {
    for (const s of ['created', 'processing']) {
      expect(withdrawalNextStep(open, order(s, 'succeeded'), today)).toMatchObject({
        step: 'refund',
        why: 'notShipped',
      })
    }
    // processing also matches with a status "processing" withdrawal
    expect(
      withdrawalNextStep({ ...open, status: 'processing' }, order('created', 'succeeded'), today)
        .step,
    ).toBe('refund')
  })

  it('open + partially refunded → partial with the refunded total', () => {
    expect(
      withdrawalNextStep(
        open,
        order('delivered', 'partiallyRefunded', [
          { amount: 1500, status: 'succeeded' },
          { amount: 500, status: 'failed' },
        ]),
        today,
      ),
    ).toMatchObject({ step: 'partial', refundedCents: 1500 })
  })

  it('open + canceled / returned (not refunded) → refund (nothing to wait for)', () => {
    for (const s of ['canceled', 'returned']) {
      expect(withdrawalNextStep(open, order(s, 'succeeded'), today)).toMatchObject({
        step: 'refund',
        why: 'nothingToWait',
      })
    }
  })

  it('open + shipped / delivered → wait', () => {
    for (const s of ['shipped', 'delivered']) {
      expect(withdrawalNextStep(open, order(s, 'succeeded'), today).step).toBe('wait')
    }
  })

  it('open without order → noOrder', () => {
    expect(withdrawalNextStep(open, null, today).step).toBe('noOrder')
  })

  it('refunded → done with the amount and the latest counted refund date', () => {
    expect(
      withdrawalNextStep(
        { status: 'refunded', declaredAt: declared },
        order('shipped', 'refunded', [
          { amount: 2000, status: 'succeeded', createdAt: '2026-11-05T10:00:00Z' },
          { amount: 8000, status: 'succeeded', createdAt: '2026-11-08T10:00:00Z' },
          { amount: 100, status: 'failed', createdAt: '2026-11-09T10:00:00Z' },
        ]),
        today,
      ),
    ).toEqual({ step: 'done', refundedCents: 10000, lastRefundAt: '2026-11-08T10:00:00Z' })
    expect(withdrawalNextStep({ status: 'refunded' }, order('shipped', 'refunded'), today)).toEqual(
      { step: 'done', refundedCents: 0 },
    )
  })

  it('rejected → rejected, no deadline', () => {
    expect(withdrawalNextStep({ status: 'rejected', declaredAt: declared }, null, today)).toEqual({
      step: 'rejected',
    })
  })
})

describe('resolveOptions', () => {
  it('nothing refunded → full (default) or partial', () => {
    expect(resolveOptions({ paymentStatus: 'succeeded' })).toEqual({
      options: ['full', 'partial'],
      defaultChoice: 'full',
    })
  })
  it('partially refunded → full / partial / close only, no default', () => {
    expect(resolveOptions({ paymentStatus: 'partiallyRefunded' })).toEqual({
      options: ['full', 'partial', 'closeOnly'],
    })
  })
  it('refunded → close only', () => {
    expect(resolveOptions({ paymentStatus: 'refunded' })).toEqual({
      options: ['closeOnly'],
      defaultChoice: 'closeOnly',
    })
  })
})

describe('"Goods are back" (returnedOffered)', () => {
  it('offered for shipped / delivered orders, full or partial', () => {
    for (const s of ['shipped', 'delivered'] as const) {
      expect(returnedOffered(s, 'refunded')).toBe(true)
      expect(returnedOffered(s, 'partiallyRefunded')).toBe(true)
    }
  })
  it('not for undispatched or closed orders', () => {
    expect(returnedOffered('created', 'partiallyRefunded')).toBe(false)
    expect(returnedOffered('processing', 'refunded')).toBe(false)
    expect(returnedOffered('canceled', 'refunded')).toBe(false)
    expect(returnedOffered('returned', 'partiallyRefunded')).toBe(false)
  })
})

describe('withdrawalActionsFor', () => {
  const ref = { _ref: 'order-1' }
  it('assign: unmatched only', () => {
    expect(withdrawalActionsFor({ status: 'unmatched' }).assign).toBe(true)
    expect(withdrawalActionsFor({ status: 'received', orderRef: ref }).assign).toBe(false)
  })
  it('unassign: received + assignedAt only', () => {
    expect(
      withdrawalActionsFor({ status: 'received', orderRef: ref, assignedAt: '2026-11-09' })
        .unassign,
    ).toBe(true)
    expect(withdrawalActionsFor({ status: 'received', orderRef: ref }).unassign).toBe(false)
    expect(
      withdrawalActionsFor({ status: 'processing', orderRef: ref, assignedAt: '2026-11-09' })
        .unassign,
    ).toBe(false)
  })
  it('resolve: open + orderRef', () => {
    expect(withdrawalActionsFor({ status: 'received', orderRef: ref }).resolve).toBe(true)
    expect(withdrawalActionsFor({ status: 'processing', orderRef: ref }).resolve).toBe(true)
    expect(withdrawalActionsFor({ status: 'received' }).resolve).toBe(false)
    expect(withdrawalActionsFor({ status: 'refunded', orderRef: ref }).resolve).toBe(false)
    expect(withdrawalActionsFor(null)).toEqual({ assign: false, unassign: false, resolve: false })
  })
})

describe('refundOrder stale check', () => {
  const order = { _id: 'order-1', status: 'shipped' as const }
  const setup = (current: object) => {
    const commit = vi.fn().mockResolvedValue({})
    const append = vi.fn(() => ({ commit }))
    const set = vi.fn(() => ({ append }))
    const sanityClient = {
      fetch: vi.fn().mockResolvedValue(current),
      patch: vi.fn(() => ({ set })),
    }
    const frontendClient = {
      refundPayment: vi
        .fn()
        .mockResolvedValue({ data: { refundId: 're_1', status: 'succeeded', amount: 3000 } }),
    }
    return { sanityClient, frontendClient, set, append, commit }
  }

  it('snapshot unchanged → refunds and patches', async () => {
    const m = setup({ paymentStatus: 'succeeded', refunds: [] })
    const result = await refundOrder({
      sanityClient: m.sanityClient as never,
      frontendClient: m.frontendClient,
      order,
      expected: { paymentStatus: 'succeeded', refundedCents: 0 },
      refund: 'partial',
      amountCents: 3000,
      newKey: () => 'k',
      now: () => new Date('2026-11-09T10:00:00Z'),
    })
    expect(result).toEqual({ ok: true, refundedCents: 3000 })
    expect(m.frontendClient.refundPayment).toHaveBeenCalledWith('order-1', { amount: 3000 })
    expect(m.set).toHaveBeenCalledWith({ paymentStatus: 'partiallyRefunded' })
  })

  it('payment status changed meanwhile → refuses without refunding', async () => {
    const m = setup({ paymentStatus: 'partiallyRefunded', refunds: [] })
    const result = await refundOrder({
      sanityClient: m.sanityClient as never,
      frontendClient: m.frontendClient,
      order,
      expected: { paymentStatus: 'succeeded', refundedCents: 0 },
      refund: 'full',
    })
    expect(result).toEqual({ ok: false, code: 'changedMeanwhile' })
    expect(m.frontendClient.refundPayment).not.toHaveBeenCalled()
    expect(m.sanityClient.patch).not.toHaveBeenCalled()
  })

  it('refunded total changed meanwhile → refuses without refunding', async () => {
    const m = setup({
      paymentStatus: 'partiallyRefunded',
      refunds: [
        { amount: 1000, status: 'succeeded' },
        { amount: 1000, status: 'succeeded' },
      ],
    })
    const result = await refundOrder({
      sanityClient: m.sanityClient as never,
      frontendClient: m.frontendClient,
      order,
      expected: { paymentStatus: 'partiallyRefunded', refundedCents: 1000 },
      refund: 'partial',
      amountCents: 500,
    })
    expect(result).toEqual({ ok: false, code: 'changedMeanwhile' })
    expect(m.frontendClient.refundPayment).not.toHaveBeenCalled()
  })

  it("refund 'none' + markReturned → no refund call, returned patch", async () => {
    const m = setup({ paymentStatus: 'refunded', refunds: [] })
    const result = await refundOrder({
      sanityClient: m.sanityClient as never,
      frontendClient: m.frontendClient,
      order,
      expected: { paymentStatus: 'refunded', refundedCents: 0 },
      refund: 'none',
      markReturned: true,
    })
    expect(result).toEqual({ ok: true, refundedCents: undefined })
    expect(m.frontendClient.refundPayment).not.toHaveBeenCalled()
    expect(m.set).toHaveBeenCalledWith({ status: 'returned' })
  })
})
