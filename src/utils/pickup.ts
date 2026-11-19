// Pickup ("click & collect") rules shared by the order view. Pure — unit-tested in
// `tests/pickup.test.ts`. core-front has the same `pickupDeadline` (`src/shared/pickup.ts`,
// same test table); the packages share no code.

import { localDatePlus } from './withdrawals'

export type PickupHistoryEntry = { type?: string; status?: string; timestamp?: string }

/**
 * Last day to collect a pickup order: the calendar date (browser timezone) of the latest
 * `fulfillment`/`shipped` ("ready for pickup") history entry + `holdDays`. `null` without such
 * an entry or without `holdDays` (no hold period set on the pickup method).
 */
export const pickupDeadline = (
  statusHistory: PickupHistoryEntry[] | undefined,
  holdDays: number | undefined | null,
): Date | null => {
  if (!holdDays) return null
  const readyAt = (statusHistory ?? [])
    .filter((e) => e.type === 'fulfillment' && e.status === 'shipped' && e.timestamp)
    .map((e) => e.timestamp as string)
    .sort()
    .pop()
  return readyAt ? localDatePlus(readyAt, holdDays) : null
}

/** Whether `today` is past the pickup deadline (the deadline day itself is still in time). */
export const pickupOverdue = (deadline: Date, today: Date = new Date()): boolean =>
  localDatePlus(today).getTime() > deadline.getTime()
