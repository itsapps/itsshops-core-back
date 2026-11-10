// Pure rules for withdrawals ("Widerruf", `orderWithdrawal`): open statuses, the refund deadline,
// the editor's next step, the "Refund & close" options and which actions a withdrawal offers.
// No Sanity / React imports — unit-tested in `tests/withdrawals.test.ts`.

import {
  getAllowedFulfillmentTransitions,
  type OrderPaymentStatus,
  type OrderStatus,
} from './orderTransitions'
import { refundedTotal, type RefundLike } from './orderRefunds'

/**
 * Withdrawals that still block a new one on the same order (same list as core-front's web
 * endpoint dedupe and wc-api).
 */
export const OPEN_STATUSES = ['received', 'processing'] as const

export type WithdrawalStatus = 'unmatched' | 'received' | 'processing' | 'refunded' | 'rejected'

export const isOpenWithdrawal = (status?: string): boolean =>
  (OPEN_STATUSES as readonly string[]).includes(status ?? '')

/** FAGG §14: refund within 14 days of receiving the declaration. */
export const REFUND_DAYS = 14
/** The guide turns `caution` this many days before the due date. */
export const CAUTION_DAYS = 3
/** Unmatched declarations: delete after checking, at the latest after 30 days. */
export const UNMATCHED_DAYS = 30

/** Local calendar date (midnight, browser timezone) of `date`, plus `days`. */
export const localDatePlus = (date: string | Date, days = 0): Date => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
}

export type WithdrawalDeadline = {
  /** Last day of the refund period (local date, midnight). */
  dueDate: Date
  tone: 'default' | 'caution' | 'critical'
  /** First overdue day — set only when `today` is past `dueDate`. */
  overdueSince?: Date
}

/**
 * Refund deadline of a withdrawal declared at `declaredAt`: its calendar date (browser timezone)
 * + 14 days. `caution` from 3 days before, `critical` once `today` is past the due date. Dates
 * only, no time of day, no shop timezone.
 */
export const withdrawalDeadline = (
  declaredAt: string | Date,
  today: Date = new Date(),
): WithdrawalDeadline => {
  const dueDate = localDatePlus(declaredAt, REFUND_DAYS)
  const day = localDatePlus(today).getTime()
  if (day > dueDate.getTime()) {
    return { dueDate, tone: 'critical', overdueSince: localDatePlus(dueDate, 1) }
  }
  const tone = day >= localDatePlus(dueDate, -CAUTION_DAYS).getTime() ? 'caution' : 'default'
  return { dueDate, tone }
}

export type WithdrawalLike = {
  status?: string
  declaredAt?: string
  orderRef?: { _ref?: string }
  assignedAt?: string
}

export type WithdrawalOrderLike = {
  status?: string
  paymentStatus?: string
  grandTotal?: number
  refunds?: (RefundLike & { createdAt?: string })[]
}

export type WithdrawalStep =
  'assign' | 'close' | 'refund' | 'partial' | 'wait' | 'done' | 'rejected' | 'noOrder'

export type WithdrawalNextStep = {
  step: WithdrawalStep
  /** `refund` only: why there is nothing to wait for. */
  why?: 'notShipped' | 'nothingToWait'
  /** Open and unmatched withdrawals: the refund deadline. */
  deadline?: WithdrawalDeadline
  /** `assign`: delete-by date for non-customers (declaredAt + 30 days). */
  assignBy?: Date
  /** `partial` / `done`: cents refunded so far (counted stored refunds; 0 if none stored). */
  refundedCents?: number
  /** `done`: date of the latest counted stored refund. */
  lastRefundAt?: string
}

const counted = (r: RefundLike) => r.status !== 'failed' && r.status !== 'canceled'

/** Latest `createdAt` among the counted stored refunds. */
export const lastRefundAt = (refunds?: WithdrawalOrderLike['refunds']): string | undefined =>
  (refunds ?? [])
    .filter(counted)
    .map((r) => r.createdAt)
    .filter((d): d is string => !!d)
    .sort()
    .pop()

/**
 * What the editor does next with a withdrawal (first matching row wins). `order` is the linked
 * order (null when the withdrawal has none or it doesn't exist).
 */
export const withdrawalNextStep = (
  withdrawal: WithdrawalLike,
  order: WithdrawalOrderLike | null | undefined,
  today: Date = new Date(),
): WithdrawalNextStep => {
  const { status, declaredAt } = withdrawal
  const deadline = declaredAt ? withdrawalDeadline(declaredAt, today) : undefined
  if (status === 'unmatched') {
    // If it's a customer (mistyped number / email), the refund period already runs.
    return {
      step: 'assign',
      ...(declaredAt && { assignBy: localDatePlus(declaredAt, UNMATCHED_DAYS) }),
      ...(deadline && { deadline }),
    }
  }
  if (status === 'refunded') {
    const refundedCents = refundedTotal(order?.refunds)
    const last = lastRefundAt(order?.refunds)
    return { step: 'done', refundedCents, ...(last && { lastRefundAt: last }) }
  }
  if (status === 'rejected') return { step: 'rejected' }

  // received / processing
  const withDeadline = (next: WithdrawalNextStep): WithdrawalNextStep =>
    deadline ? { ...next, deadline } : next
  if (!order) return withDeadline({ step: 'noOrder' })
  if (order.paymentStatus === 'refunded') return withDeadline({ step: 'close' })
  if (order.status === 'created' || order.status === 'processing') {
    return withDeadline({ step: 'refund', why: 'notShipped' })
  }
  if (order.paymentStatus === 'partiallyRefunded') {
    return withDeadline({ step: 'partial', refundedCents: refundedTotal(order.refunds) })
  }
  if (order.status === 'canceled' || order.status === 'returned') {
    return withDeadline({ step: 'refund', why: 'nothingToWait' })
  }
  return withDeadline({ step: 'wait' })
}

export type ResolveChoice = 'full' | 'partial' | 'closeOnly'

/**
 * Options of "Refund & close" for the order's payment status. A preselected `full` only when
 * nothing was refunded yet — after a partial refund the editor must pick, so the rest is never
 * refunded by accident.
 */
export const resolveOptions = (order: {
  paymentStatus?: string
}): { options: ResolveChoice[]; defaultChoice?: ResolveChoice } => {
  switch (order.paymentStatus) {
    case 'refunded':
      return { options: ['closeOnly'], defaultChoice: 'closeOnly' }
    case 'partiallyRefunded':
      return { options: ['full', 'partial', 'closeOnly'] }
    default:
      return { options: ['full', 'partial'], defaultChoice: 'full' }
  }
}

/** Payment status of the order after "Refund & close" with `choice`. */
export const paymentStatusAfter = (
  choice: ResolveChoice,
  current: OrderPaymentStatus,
): OrderPaymentStatus => {
  if (choice === 'full') return 'refunded'
  if (choice === 'partial') return 'partiallyRefunded'
  return current
}

/** Whether "Goods are back" is offered: `returned` is a legal next state after the refund. */
export const returnedOffered = (
  orderStatus: OrderStatus,
  paymentStatus: OrderPaymentStatus,
): boolean => getAllowedFulfillmentTransitions(orderStatus, paymentStatus).includes('returned')

/** Which withdrawal document actions apply. */
export const withdrawalActionsFor = (
  withdrawal: WithdrawalLike | null | undefined,
): { assign: boolean; unassign: boolean; resolve: boolean } => ({
  assign: withdrawal?.status === 'unmatched',
  // Only Studio assignments can be undone — web-matched records are the customer's own match.
  unassign: withdrawal?.status === 'received' && !!withdrawal.assignedAt,
  resolve: isOpenWithdrawal(withdrawal?.status) && !!withdrawal?.orderRef?._ref,
})
