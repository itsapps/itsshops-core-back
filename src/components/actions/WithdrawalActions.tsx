/**
 * Withdrawal ("Widerruf") document actions. Withdrawals are `liveEdit`, so every write here
 * lands on the published document right away (no draft, no "Publish").
 *
 *  - `OrderWithdrawalCreateAction` (on `order`): log a withdrawal received offline
 *    (phone/letter). Dialog: declared date (not in the future), reason, "notify customer"
 *    (default on). Creates the `orderWithdrawal` and, if checked, mails the confirmation.
 *
 *  - `WithdrawalAssignAction` (on an `unmatched` withdrawal): pick the order (suggestions from
 *    the submitted details or a search by order number / email), confirm → one patch
 *    (`orderRef`, `status: received`, `assignedAt`) guarded by the revision, then optionally the
 *    confirmation mail to the order's email. Replaces the old editable field + "Publish".
 *
 *  - `WithdrawalUnassignAction` (undo a wrong pick): only while `received` and `assignedAt` is
 *    set (assigned in the Studio). Back to `unmatched`, a line in `note`.
 *
 *  - `WithdrawalResendAction`: resend the customer confirmation (e.g. after a delivery failure).
 *
 *  - `WithdrawalResolveAction` (on an open withdrawal): "Refund & close" — full or partial refund
 *    (or close only when something was refunded already), optional "goods are back", then the
 *    withdrawal → `refunded`. The refund itself is `lib/shop/orderRefund.ts` (shared with the
 *    order's status dialog).
 *
 * Mail paths: `frontendClient.withdrawNotify` (customer confirmation only — the shop already
 * knows) and `frontendClient.notifyOrder` (refund mails).
 */
import { ConfirmIcon, OrderWithdrawalIcon, SendMailIcon } from '../../assets/icons'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Radio,
  Stack,
  Text,
  TextArea,
  TextInput,
} from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { DocumentActionDescription, DocumentActionProps, SanityClient } from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'
import type { TranslatorFunction } from '../../types/localization'
import { refundOrder, refundSnapshot, type RefundOrderResult } from '../../lib/shop/orderRefund'
import { refundedTotal, remainingAmount } from '../../utils/orderRefunds'
import type { OrderPaymentStatus, OrderStatus } from '../../utils/orderTransitions'
import {
  OPEN_STATUSES,
  paymentStatusAfter,
  resolveOptions,
  returnedOffered,
  withdrawalActionsFor,
  type ResolveChoice,
} from '../../utils/withdrawals'

const OPEN_WITHDRAWAL_QUERY = `*[_type == "orderWithdrawal" && !(_id in path("drafts.**")) && orderRef._ref == $id && status in $open][0]{ _id }`

/** The order's open (received|processing) withdrawal, if any. */
export async function fetchOpenWithdrawal(
  client: SanityClient,
  orderId: string,
): Promise<{ _id: string } | null> {
  const cleanId = orderId.replace(/^drafts\./, '')
  return client.fetch<{ _id: string } | null>(OPEN_WITHDRAWAL_QUERY, {
    id: cleanId,
    open: OPEN_STATUSES,
  })
}

/** Live: the order's open withdrawal (or null). Refetches on dataset changes. */
export function useOpenWithdrawal(orderId: string | undefined): { _id: string } | null {
  const { sanityClient } = useITSContext()
  const [open, setOpen] = useState<{ _id: string } | null>(null)
  const cleanId = orderId?.replace(/^drafts\./, '')

  useEffect(() => {
    if (!cleanId) return undefined

    let active = true
    const load = () => {
      fetchOpenWithdrawal(sanityClient, cleanId).then((v) => {
        if (active) setOpen(v)
      })
    }
    load()
    const sub = sanityClient
      .listen(
        `*[_type == "orderWithdrawal" && orderRef._ref == $id]`,
        { id: cleanId },
        { visibility: 'query' },
      )
      .subscribe(() => load())
    return () => {
      active = false
      sub.unsubscribe()
    }
  }, [cleanId, sanityClient])

  return open
}

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err))

/** A revision-guarded patch failed because the document changed meanwhile. */
const isRevisionMismatch = (err: unknown) =>
  (err as { statusCode?: number })?.statusCode === 409 || /revision/i.test(errorMessage(err))

/** `datetime-local` value (YYYY-MM-DDTHH:mm) of `date` in local wall-clock time. */
const toLocalInputValue = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

// ── Declare withdrawal (on the order) ───────────────────────────────────────

export function OrderWithdrawalCreateAction(props: DocumentActionProps): DocumentActionDescription {
  const order = props.published as { _id: string } | null
  const { componentT } = useITSContext()
  const t = componentT.default
  const [dialogOpen, setDialogOpen] = useState(false)
  const openExists = !!useOpenWithdrawal(order?._id)

  const handleOpen = useCallback(() => setDialogOpen(true), [])
  const handleClose = useCallback(() => setDialogOpen(false), [])

  const label = t('actions.orderWithdrawal.create.title', 'Declare withdrawal')

  if (!order) {
    return { label, icon: OrderWithdrawalIcon, disabled: true }
  }

  // Mirror the web endpoint's dedupe: block while an open withdrawal exists.
  // A closed (refunded/rejected) prior one does not block a fresh declaration.
  // Not while the dialog is open: creating makes `openExists` true, and dropping the dialog then
  // would cut off the confirmation mail (and hide its error).
  if (openExists && !dialogOpen) {
    return {
      label,
      icon: OrderWithdrawalIcon,
      disabled: true,
      title: t(
        'actions.orderWithdrawal.create.alreadyOpen',
        'An open withdrawal already exists for this order',
      ),
    }
  }

  return {
    label,
    icon: OrderWithdrawalIcon,
    onHandle: handleOpen,
    dialog: dialogOpen && {
      type: 'dialog',
      header: label,
      onClose: handleClose,
      content: <CreateWithdrawalContent orderId={order._id} onComplete={handleClose} />,
    },
  }
}

function CreateWithdrawalContent({
  orderId,
  onComplete,
}: {
  orderId: string
  onComplete: () => void
}) {
  const { componentT, sanityClient, frontendClient, format } = useITSContext()
  const t = componentT.default
  const toast = useToast()

  const [reason, setReason] = useState('')
  // `datetime-local` value in local wall-clock, defaulting to now. It drives the refund
  // deadline and is read-only afterwards — never empty, never in the future.
  const [dateStr, setDateStr] = useState(() => toLocalInputValue(new Date()))
  const [maxDate] = useState(() => toLocalInputValue(new Date()))
  const [notify, setNotify] = useState(true)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const parsedDate = dateStr ? new Date(dateStr) : undefined
  // Same-format strings compare by time; `maxDate` = when the dialog opened (handleConfirm
  // re-checks against now).
  const dateValid = !!parsedDate && !Number.isNaN(parsedDate.getTime()) && dateStr <= maxDate

  const handleReasonChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setReason(e.currentTarget.value),
    [],
  )
  const handleDateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setDateStr(e.currentTarget.value),
    [],
  )
  const handleNotifyChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setNotify(e.currentTarget.checked),
    [],
  )

  const handleConfirm = useCallback(async () => {
    const declared = dateStr ? new Date(dateStr) : undefined
    if (!declared || Number.isNaN(declared.getTime()) || declared.getTime() > Date.now()) return
    setLoading(true)
    setStatus('')

    // Guard against a race (concurrent admin / double-submit): re-check just
    // before creating, since the action button's disabled state can be stale.
    if (await fetchOpenWithdrawal(sanityClient, orderId)) {
      setStatus(
        t(
          'actions.orderWithdrawal.create.alreadyOpen',
          'An open withdrawal already exists for this order',
        ),
      )
      setLoading(false)
      return
    }

    let createdId: string
    try {
      const created = await sanityClient.create({
        _type: 'orderWithdrawal',
        orderRef: { _type: 'reference', _ref: orderId },
        declaredAt: declared.toISOString(),
        status: 'received',
        ...(reason.trim() && { reason: reason.trim() }),
      })
      createdId = created._id
    } catch (err) {
      setStatus(
        `${t('actions.orderWithdrawal.create.error', 'Could not create the withdrawal')}: ${errorMessage(err)}`,
      )
      setLoading(false)
      return
    }

    let mailedTo: string | undefined
    if (notify) {
      const result = await frontendClient.withdrawNotify(createdId)
      if (result.error) {
        setStatus(
          `${t('actions.orderWithdrawal.notifyError', 'Saved, but the email could not be sent')}: ${result.error}`,
        )
        setLoading(false)
        return
      }
      mailedTo = result.data?.to
    }

    setLoading(false)
    toast.push({
      status: 'success',
      title: mailedTo
        ? t(
            'actions.orderWithdrawal.create.successMailed',
            'Withdrawal declared — confirmation sent to {{email}}',
            { email: mailedTo },
          )
        : t('actions.orderWithdrawal.create.success', 'Withdrawal declared'),
    })
    onComplete()
  }, [dateStr, reason, notify, orderId, sanityClient, frontendClient, toast, t, onComplete])

  return (
    <Stack padding={4} gap={4}>
      <Stack gap={2}>
        <Text size={1} weight="semibold">
          <label htmlFor="withdrawal-declared-at-input">
            {t('actions.orderWithdrawal.create.declaredAt', 'Declared on')}
          </label>
        </Text>
        <TextInput
          id="withdrawal-declared-at-input"
          type="datetime-local"
          value={dateStr}
          max={maxDate}
          required
          onChange={handleDateChange}
          aria-invalid={!dateValid}
          aria-describedby="withdrawal-declared-at-hint"
        />
        <Text size={1} muted id="withdrawal-declared-at-hint">
          {dateValid && parsedDate
            ? `${format.date(parsedDate, { dateStyle: 'long', timeStyle: 'short' })} · ${t(
                'actions.orderWithdrawal.create.declaredAtHint',
                'Date the withdrawal was received',
              )}`
            : t(
                'actions.orderWithdrawal.create.declaredAtInvalid',
                'Enter the date the withdrawal was received — not in the future',
              )}
        </Text>
      </Stack>

      <Stack gap={2}>
        <Text size={1} weight="semibold">
          <label htmlFor="withdrawal-reason-input">
            {t('actions.orderWithdrawal.create.reason', 'Reason / affected items (optional)')}
          </label>
        </Text>
        <TextArea
          id="withdrawal-reason-input"
          rows={3}
          value={reason}
          onChange={handleReasonChange}
        />
      </Stack>

      <Flex align="center" gap={2}>
        <Checkbox id="withdrawal-notify-checkbox" checked={notify} onChange={handleNotifyChange} />
        <Box flex={1}>
          <Text>
            <label htmlFor="withdrawal-notify-checkbox">
              {t('actions.orderWithdrawal.create.notify', 'Send confirmation email to customer')}
            </label>
          </Text>
        </Box>
      </Flex>

      <Flex gap={2} justify="flex-end">
        <Button mode="ghost" text={t('ui.dialog.cancel', 'Cancel')} onClick={onComplete} />
        <Button
          tone="primary"
          text={t('ui.dialog.confirm', 'Confirm')}
          loading={loading}
          disabled={loading || !dateValid}
          onClick={handleConfirm}
        />
      </Flex>

      <StatusLine status={status} />
    </Stack>
  )
}

/** Result / error line of a dialog, announced politely. */
function StatusLine({ status }: { status: string }) {
  return (
    <Box marginTop={status ? 3 : 0} aria-live="polite">
      {status && <Text size={1}>{status}</Text>}
    </Box>
  )
}

// ── Assign order (unmatched withdrawal) ─────────────────────────────────────

type WithdrawalActionDoc = {
  _id: string
  _rev: string
  status?: string
  orderRef?: { _ref?: string }
  assignedAt?: string
  declaredAt?: string
  name?: string
  email?: string
  orderNumber?: string
  note?: string
}

type OrderCandidate = {
  _id: string
  /** Suggestions only: which submitted details match (order number, email, name). */
  matches?: ('orderNumber' | 'email' | 'name' | null)[]
  orderNumber?: string
  createdAt: string
  name?: string
  email?: string
  total?: number
}

const CANDIDATE_FIELDS = `
  _id,
  orderNumber,
  "createdAt": _createdAt,
  "name": customer.billingAddress.name,
  "email": customer.contactEmail,
  "total": totals.grandTotal`
const CANDIDATE_PROJECTION = `{${CANDIDATE_FIELDS}
}`
/** Orders without an open withdrawal (a second one can't be assigned). */
const NO_OPEN_WITHDRAWAL = `!(_id in *[_type == "orderWithdrawal" && status in $open && defined(orderRef._ref)].orderRef._ref)`

// Exact order number first, then email, then name (newest first within each): otherwise newer
// orders sharing only the email or name push the right one out of the 5 slots.
const SUGGESTIONS_QUERY = `*[_type == "order" && !(_id in path("drafts.**")) && (
    orderNumber == $orderNumber ||
    lower(customer.contactEmail) == $email ||
    lower(customer.billingAddress.name) == $name
  ) && ${NO_OPEN_WITHDRAWAL}
] | order(
    select(orderNumber == $orderNumber => 0, lower(customer.contactEmail) == $email => 1, 2) asc,
    _createdAt desc
  )[0...5]{
  ${CANDIDATE_FIELDS},
  "matches": [
    select(orderNumber == $orderNumber => "orderNumber"),
    select(lower(customer.contactEmail) == $email => "email"),
    select(lower(customer.billingAddress.name) == $name => "name")
  ]
}`

const SEARCH_QUERY = `*[_type == "order" && !(_id in path("drafts.**")) && (
    orderNumber == $q || lower(customer.contactEmail) == lower($q)
  ) && ${NO_OPEN_WITHDRAWAL}
] | order(_createdAt desc)[0...5]${CANDIDATE_PROJECTION}`

export function WithdrawalAssignAction(
  props: DocumentActionProps,
): DocumentActionDescription | null {
  const wd = props.published as WithdrawalActionDoc | null
  const { componentT } = useITSContext()
  const t = componentT.default
  // The withdrawal as the dialog opened it (its `_rev` guards the patch). The action stays while
  // its dialog is open: the patch makes it inapplicable, and unmounting the dialog then would hide
  // the mail step (and its error).
  const [opened, setOpened] = useState<WithdrawalActionDoc | null>(null)

  const handleOpen = useCallback(() => setOpened(wd), [wd])
  const handleClose = useCallback(() => setOpened(null), [])

  if (!opened && (!wd || !withdrawalActionsFor(wd).assign)) return null

  const label = t('actions.orderWithdrawal.assign.title', 'Assign order')
  return {
    label,
    icon: OrderWithdrawalIcon,
    onHandle: handleOpen,
    dialog: !!opened && {
      type: 'dialog',
      header: label,
      onClose: handleClose,
      content: (
        <AssignWithdrawalContent withdrawal={opened} rev={opened._rev} onComplete={handleClose} />
      ),
    },
  }
}

function AssignWithdrawalContent({
  withdrawal,
  rev,
  onComplete,
}: {
  withdrawal: WithdrawalActionDoc
  rev: string
  onComplete: () => void
}) {
  const { componentT, sanityClient, frontendClient, format } = useITSContext()
  const t = componentT.default
  const toast = useToast()

  const [suggestions, setSuggestions] = useState<OrderCandidate[] | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OrderCandidate[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [picked, setPicked] = useState<OrderCandidate | null>(null)
  const [notify, setNotify] = useState(true)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let active = true
    sanityClient
      .fetch<OrderCandidate[]>(SUGGESTIONS_QUERY, {
        orderNumber: withdrawal.orderNumber?.trim() ?? '',
        email: withdrawal.email?.trim().toLowerCase() ?? '',
        name: withdrawal.name?.trim().toLowerCase() ?? '',
        open: OPEN_STATUSES,
      })
      .then((r) => {
        if (active) setSuggestions(r)
      })
    return () => {
      active = false
    }
  }, [sanityClient, withdrawal.orderNumber, withdrawal.email, withdrawal.name])

  const handleQueryChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setQuery(e.currentTarget.value),
    [],
  )
  const handleSearch = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault()
      const q = query.trim()
      if (!q) return
      setSearching(true)
      try {
        setResults(
          await sanityClient.fetch<OrderCandidate[]>(SEARCH_QUERY, { q, open: OPEN_STATUSES }),
        )
      } finally {
        setSearching(false)
      }
    },
    [query, sanityClient],
  )
  const handleNotifyChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setNotify(e.currentTarget.checked),
    [],
  )

  const handleConfirm = useCallback(async () => {
    if (!picked) return
    setLoading(true)
    setStatus('')

    if (await fetchOpenWithdrawal(sanityClient, picked._id)) {
      setStatus(
        t(
          'actions.orderWithdrawal.create.alreadyOpen',
          'An open withdrawal already exists for this order',
        ),
      )
      setLoading(false)
      return
    }

    try {
      await sanityClient
        .patch(withdrawal._id)
        .ifRevisionId(rev)
        .set({
          orderRef: { _type: 'reference', _ref: picked._id },
          status: 'received',
          assignedAt: new Date().toISOString(),
        })
        .commit()
    } catch (err) {
      setStatus(
        isRevisionMismatch(err)
          ? t(
              'actions.orderWithdrawal.changedMeanwhile',
              'The withdrawal was changed meanwhile — close this dialog and open it again',
            )
          : t('actions.order.error', 'Update failed: {{message}}', { message: errorMessage(err) }),
      )
      setLoading(false)
      return
    }

    let mailedTo: string | undefined
    if (notify) {
      const result = await frontendClient.withdrawNotify(withdrawal._id)
      if (result.error) {
        setStatus(
          `${t('actions.orderWithdrawal.notifyError', 'Saved, but the email could not be sent')}: ${result.error}`,
        )
        setLoading(false)
        return
      }
      mailedTo = result.data?.to
    }

    setLoading(false)
    const orderNumber = picked.orderNumber ?? ''
    toast.push({
      status: 'success',
      title: mailedTo
        ? t(
            'actions.orderWithdrawal.assign.successMailed',
            'Assigned to order #{{orderNumber}} — confirmation sent to {{email}}',
            { orderNumber, email: mailedTo },
          )
        : t('actions.orderWithdrawal.assign.success', 'Assigned to order #{{orderNumber}}', {
            orderNumber,
          }),
    })
    onComplete()
  }, [picked, notify, rev, withdrawal._id, sanityClient, frontendClient, toast, t, onComplete])

  const candidateLine = (c: OrderCandidate) =>
    [
      c.email,
      format.date(c.createdAt, { dateStyle: 'medium' }),
      typeof c.total === 'number' ? format.currency(c.total / 100) : null,
    ]
      .filter(Boolean)
      .join(' · ')

  return (
    <Stack padding={4} gap={4}>
      {suggestions && (
        <Stack gap={2}>
          <Text size={1} weight="semibold">
            {suggestions.length
              ? t('actions.orderWithdrawal.assign.suggestions', 'Possible orders')
              : t(
                  'actions.orderWithdrawal.assign.noSuggestions',
                  'No order matches the submitted details — search below.',
                )}
          </Text>
          {suggestions.map((s) => (
            <CandidateCard
              key={s._id}
              candidate={s}
              line={candidateLine(s)}
              selected={picked?._id === s._id}
              onSelect={setPicked}
            />
          ))}
        </Stack>
      )}

      <form onSubmit={handleSearch}>
        <Stack gap={2}>
          <Text size={1} weight="semibold">
            <label htmlFor="withdrawal-assign-search">
              {t('actions.orderWithdrawal.assign.searchLabel', 'Order number or email')}
            </label>
          </Text>
          <Flex gap={2}>
            <Box flex={1}>
              <TextInput id="withdrawal-assign-search" value={query} onChange={handleQueryChange} />
            </Box>
            <Button
              type="submit"
              mode="ghost"
              text={t('actions.orderWithdrawal.assign.search', 'Search')}
              loading={searching}
              disabled={!query.trim() || searching}
            />
          </Flex>
          <Box aria-live="polite">
            {results && (
              <Text size={1} muted>
                {results.length
                  ? t('actions.orderWithdrawal.assign.results', '{{count}} orders found', {
                      count: results.length,
                    })
                  : t('actions.orderWithdrawal.assign.noResults', 'No order found')}
              </Text>
            )}
          </Box>
          {results?.map((r) => (
            <CandidateCard
              key={r._id}
              candidate={r}
              line={candidateLine(r)}
              selected={picked?._id === r._id}
              onSelect={setPicked}
            />
          ))}
        </Stack>
      </form>

      {picked && (
        <Card padding={3} radius={2} tone="primary" border>
          <Stack gap={3}>
            <Text size={1} weight="semibold">
              {t('actions.orderWithdrawal.assign.picked', 'Assign to order #{{orderNumber}}', {
                orderNumber: picked.orderNumber ?? '',
              })}
            </Text>
            <Text size={1}>
              {[picked.name, picked.email, format.date(picked.createdAt, { dateStyle: 'medium' })]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            <Flex align="center" gap={2}>
              <Checkbox
                id="withdrawal-assign-notify"
                checked={notify}
                onChange={handleNotifyChange}
              />
              <Box flex={1}>
                <Text size={1}>
                  <label htmlFor="withdrawal-assign-notify">
                    {t(
                      'actions.orderWithdrawal.assign.notify',
                      'Send the confirmation to the order’s email ({{email}})',
                      { email: picked.email ?? '' },
                    )}
                  </label>
                </Text>
              </Box>
            </Flex>
          </Stack>
        </Card>
      )}

      <Flex gap={2} justify="flex-end">
        <Button mode="ghost" text={t('ui.dialog.cancel', 'Cancel')} onClick={onComplete} />
        <Button
          tone="primary"
          text={t('ui.dialog.confirm', 'Confirm')}
          loading={loading}
          disabled={!picked || loading}
          onClick={handleConfirm}
        />
      </Flex>

      <StatusLine status={status} />
    </Stack>
  )
}

function CandidateCard({
  candidate: c,
  line,
  selected,
  onSelect,
}: {
  candidate: OrderCandidate
  line: string
  selected: boolean
  onSelect: (candidate: OrderCandidate) => void
}) {
  const { componentT } = useITSContext()
  const t = componentT.default
  const handleClick = useCallback(() => onSelect(c), [onSelect, c])
  const reasons = (c.matches ?? [])
    .filter((m): m is 'orderNumber' | 'email' | 'name' => !!m)
    .map((m) => t(`actions.orderWithdrawal.assign.match.${m}`, m))
    .join(', ')
  return (
    <Card padding={3} radius={2} border tone={selected ? 'primary' : 'default'}>
      <Flex align="center" gap={3}>
        <Box flex={1}>
          <Stack gap={2}>
            <Text size={1} weight="semibold">
              #{c.orderNumber} · {c.name}
            </Text>
            <Text size={1} muted>
              {line}
            </Text>
            {reasons && (
              <Text size={1}>
                {t('actions.orderWithdrawal.assign.matches', 'Matches: {{fields}}', {
                  fields: reasons,
                })}
              </Text>
            )}
          </Stack>
        </Box>
        <Button
          mode={selected ? 'default' : 'ghost'}
          tone={selected ? 'primary' : 'default'}
          text={t('actions.orderWithdrawal.assign.select', 'Select')}
          aria-pressed={selected}
          aria-label={`${t('actions.orderWithdrawal.assign.select', 'Select')} #${c.orderNumber ?? ''}`}
          onClick={handleClick}
        />
      </Flex>
    </Card>
  )
}

// ── Unassign (undo a wrong pick) ────────────────────────────────────────────

export function WithdrawalUnassignAction(
  props: DocumentActionProps,
): DocumentActionDescription | null {
  const wd = props.published as WithdrawalActionDoc | null
  const { componentT } = useITSContext()
  const t = componentT.default
  // Snapshot + stays while open — see `WithdrawalAssignAction`.
  const [opened, setOpened] = useState<WithdrawalActionDoc | null>(null)

  const handleOpen = useCallback(() => setOpened(wd), [wd])
  const handleClose = useCallback(() => setOpened(null), [])

  if (!opened && (!wd || !withdrawalActionsFor(wd).unassign || !wd.orderRef?._ref)) return null

  const label = t('actions.orderWithdrawal.unassign.title', 'Unassign order')
  return {
    label,
    icon: OrderWithdrawalIcon,
    onHandle: handleOpen,
    dialog: !!opened && {
      type: 'dialog',
      header: label,
      onClose: handleClose,
      content: (
        <UnassignWithdrawalContent withdrawal={opened} rev={opened._rev} onComplete={handleClose} />
      ),
    },
  }
}

function UnassignWithdrawalContent({
  withdrawal,
  rev,
  onComplete,
}: {
  withdrawal: WithdrawalActionDoc
  rev: string
  onComplete: () => void
}) {
  const { componentT, sanityClient, format } = useITSContext()
  const t = componentT.default
  const toast = useToast()
  const orderId = withdrawal.orderRef?._ref ?? ''

  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let active = true
    sanityClient.fetch<string | null>(`*[_id == $id][0].orderNumber`, { id: orderId }).then((n) => {
      if (active) setOrderNumber(n ?? '')
    })
    return () => {
      active = false
    }
  }, [orderId, sanityClient])

  const handleConfirm = useCallback(async () => {
    setLoading(true)
    setStatus('')
    const line = t(
      'actions.orderWithdrawal.unassign.noteLine',
      'Unassigned from order #{{orderNumber}}, {{date}}',
      {
        orderNumber: orderNumber ?? '',
        date: format.date(new Date(), { dateStyle: 'medium', timeStyle: 'short' }),
      },
    )
    const note = [withdrawal.note?.trim(), line].filter(Boolean).join('\n')
    try {
      await sanityClient
        .patch(withdrawal._id)
        .ifRevisionId(rev)
        .unset(['orderRef', 'assignedAt'])
        .set({ status: 'unmatched', note })
        .commit()
    } catch (err) {
      setStatus(
        isRevisionMismatch(err)
          ? t(
              'actions.orderWithdrawal.changedMeanwhile',
              'The withdrawal was changed meanwhile — close this dialog and open it again',
            )
          : t('actions.order.error', 'Update failed: {{message}}', { message: errorMessage(err) }),
      )
      setLoading(false)
      return
    }
    setLoading(false)
    toast.push({
      status: 'success',
      title: t(
        'actions.orderWithdrawal.unassign.success',
        'Unassigned from order #{{orderNumber}}',
        {
          orderNumber: orderNumber ?? '',
        },
      ),
    })
    onComplete()
  }, [
    orderNumber,
    withdrawal._id,
    withdrawal.note,
    rev,
    sanityClient,
    format,
    toast,
    t,
    onComplete,
  ])

  return (
    <Stack padding={4} gap={4}>
      <Text>
        {orderNumber === null
          ? t('ui.loading', 'Loading…')
          : t(
              'actions.orderWithdrawal.unassign.confirm',
              'Unlink this withdrawal from order #{{orderNumber}}? It becomes “Unmatched” again and can be assigned to the right order.',
              { orderNumber },
            )}
      </Text>
      <Flex gap={2} justify="flex-end">
        <Button mode="ghost" text={t('ui.dialog.cancel', 'Cancel')} onClick={onComplete} />
        <Button
          tone="critical"
          text={t('actions.orderWithdrawal.unassign.title', 'Unassign order')}
          loading={loading}
          disabled={loading || orderNumber === null}
          onClick={handleConfirm}
        />
      </Flex>
      <StatusLine status={status} />
    </Stack>
  )
}

// ── Resend confirmation ─────────────────────────────────────────────────────

export function WithdrawalResendAction(
  props: DocumentActionProps,
): DocumentActionDescription | null {
  const wd = props.published as WithdrawalActionDoc | null
  const { componentT } = useITSContext()
  const t = componentT.default
  // Snapshot + stays while open — see `WithdrawalAssignAction`.
  const [opened, setOpened] = useState<WithdrawalActionDoc | null>(null)

  const handleOpen = useCallback(() => setOpened(wd), [wd])
  const handleClose = useCallback(() => setOpened(null), [])

  const label = t('actions.orderWithdrawal.resend.title', 'Resend confirmation')
  return {
    label,
    icon: SendMailIcon,
    disabled: !wd?._id,
    onHandle: handleOpen,
    dialog: !!opened && {
      type: 'dialog',
      header: label,
      onClose: handleClose,
      content: <ResendWithdrawalContent withdrawal={opened} onComplete={handleClose} />,
    },
  }
}

/**
 * Confirm → send; stays open with a loading button until the mail went out, closes on success.
 * Shows the address core-front's `order-withdraw-notify` really uses: the assigned order's
 * customer email, else (unmatched) the submitted one.
 */
function ResendWithdrawalContent({
  withdrawal,
  onComplete,
}: {
  withdrawal: WithdrawalActionDoc
  onComplete: () => void
}) {
  const { componentT, frontendClient, sanityClient } = useITSContext()
  const t = componentT.default
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const orderId = withdrawal.orderRef?._ref
  const submitted = withdrawal.email ?? ''
  // null = loading the order's address
  const [orderEmail, setOrderEmail] = useState<string | null>(orderId ? null : '')

  useEffect(() => {
    if (!orderId) return undefined
    let active = true
    sanityClient
      .fetch<string | null>(`*[_id == $id][0].customer.contactEmail`, { id: orderId })
      .then((email) => {
        if (active) setOrderEmail(email ?? '')
      })
      .catch(() => {
        if (active) setOrderEmail('')
      })
    return () => {
      active = false
    }
  }, [orderId, sanityClient])

  const recipient = orderEmail || submitted
  const differs =
    !!orderEmail && !!submitted && orderEmail.toLowerCase() !== submitted.toLowerCase()

  const handleSend = useCallback(async () => {
    setLoading(true)
    setStatus('')
    const result = await frontendClient.withdrawNotify(withdrawal._id)
    setLoading(false)
    if (result.error) {
      setStatus(
        `${t('actions.orderWithdrawal.resend.error', 'Email could not be sent')}: ${result.error}`,
      )
      return
    }
    toast.push({
      status: 'success',
      title: t('actions.orderWithdrawal.resend.success', 'Confirmation email sent'),
    })
    onComplete()
  }, [frontendClient, withdrawal._id, toast, t, onComplete])

  return (
    <Stack padding={4} gap={4}>
      <Text>
        {orderEmail === null
          ? t('ui.loading', 'Loading…')
          : t(
              'actions.orderWithdrawal.resend.confirm',
              'Send the withdrawal confirmation to {{email}} again?',
              { email: recipient },
            )}
      </Text>
      {differs && (
        <Text size={1} muted>
          {t(
            'actions.orderWithdrawal.resend.orderAddress',
            'The withdrawal was submitted with {{submitted}}; it is assigned to an order, so the confirmation goes to the order’s address.',
            { submitted },
          )}
        </Text>
      )}
      <Flex gap={2} justify="flex-end">
        <Button
          mode="ghost"
          text={t('ui.dialog.cancel', 'Cancel')}
          disabled={loading}
          onClick={onComplete}
        />
        <Button
          tone="primary"
          icon={SendMailIcon}
          text={t('actions.orderWithdrawal.resend.send', 'Send')}
          loading={loading}
          disabled={loading || orderEmail === null}
          onClick={handleSend}
        />
      </Flex>
      <StatusLine status={status} />
    </Stack>
  )
}

// ── Refund & close ──────────────────────────────────────────────────────────

type ResolveOrder = {
  _id: string
  orderNumber?: string
  paymentIntentId: string
  status: OrderStatus
  paymentStatus: OrderPaymentStatus
  grandTotal?: number
  refunds?: { amount: number; status?: string; createdAt?: string }[]
}

/**
 * "Refund & close" on an open withdrawal: refund the order in full or in part (or, when
 * something was refunded already, close only), optionally mark the goods back, then close the
 * withdrawal as `refunded`. A full refund of an undispatched order also cancels it.
 */
export function WithdrawalResolveAction(
  props: DocumentActionProps,
): DocumentActionDescription | null {
  const wd = props.published as WithdrawalActionDoc | null
  const { componentT } = useITSContext()
  const t = componentT.default
  // Snapshot + stays while open — see `WithdrawalAssignAction` (closing sets `refunded`).
  const [opened, setOpened] = useState<{ withdrawalId: string; orderId: string } | null>(null)

  const orderId = wd?.orderRef?._ref
  const handleOpen = useCallback(() => {
    if (wd && orderId) setOpened({ withdrawalId: wd._id, orderId })
  }, [wd, orderId])
  const handleClose = useCallback(() => setOpened(null), [])

  if (!opened && (!wd || !orderId || !withdrawalActionsFor(wd).resolve)) return null

  const label = t('actions.orderWithdrawal.resolve.title', 'Refund & close')
  return {
    label,
    icon: ConfirmIcon,
    onHandle: handleOpen,
    dialog: !!opened && {
      type: 'dialog',
      header: label,
      onClose: handleClose,
      content: (
        <ResolveWithdrawalContent
          withdrawalId={opened.withdrawalId}
          orderId={opened.orderId}
          onComplete={handleClose}
        />
      ),
    },
  }
}

export const refundErrorText = (
  result: Extract<RefundOrderResult, { ok: false }>,
  t: TranslatorFunction,
) => {
  switch (result.code) {
    case 'changedMeanwhile':
      return t(
        'actions.refund.changedMeanwhile',
        'The order was changed meanwhile — close this dialog and open it again',
      )
    case 'refundFailed':
      return t('actions.refund.error', 'Refund failed: {{message}}', {
        message: result.message ?? '',
      })
    default:
      return t('actions.order.error', 'Update failed: {{message}}', {
        message: result.message ?? '',
      })
  }
}

function ResolveWithdrawalContent({
  withdrawalId,
  orderId,
  onComplete,
}: {
  withdrawalId: string
  orderId: string
  onComplete: () => void
}) {
  const { componentT, sanityClient, frontendClient, format } = useITSContext()
  const t = componentT.default
  const toast = useToast()

  // Fetched once when the dialog opens — also the snapshot for the stale check.
  const [order, setOrder] = useState<ResolveOrder | null>(null)
  const [choice, setChoice] = useState<ResolveChoice | undefined>()
  const [partialAmount, setPartialAmount] = useState<number | undefined>()
  const [markReturned, setMarkReturned] = useState(false)
  const [notify, setNotify] = useState(true)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let active = true
    sanityClient
      .fetch<ResolveOrder | null>(
        `*[_id == $id][0]{ _id, orderNumber, paymentIntentId, status, paymentStatus, "grandTotal": totals.grandTotal, "refunds": refunds[]{ amount, status, createdAt } }`,
        { id: orderId },
      )
      .then((o) => {
        if (!active) return
        setOrder(o)
        if (o) setChoice(resolveOptions(o).defaultChoice)
      })
    return () => {
      active = false
    }
  }, [orderId, sanityClient])

  const handleChoice = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setChoice(e.currentTarget.value as ResolveChoice)
    setMarkReturned(false)
  }, [])
  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      setPartialAmount(e.currentTarget.value === '' ? undefined : Number(e.currentTarget.value)),
    [],
  )
  const handleMarkReturnedChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setMarkReturned(e.currentTarget.checked),
    [],
  )
  const handleNotifyChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setNotify(e.currentTarget.checked),
    [],
  )

  const remaining = order ? remainingAmount(order.grandTotal ?? 0, order.refunds) : 0
  // Euros → integer cents (4.35 * 100 is 434.99999999999994; Stripe takes integers only).
  const partialCents = partialAmount === undefined ? undefined : Math.round(partialAmount * 100)
  const partialValid = partialCents !== undefined && partialCents > 0 && partialCents < remaining
  const refunds = choice === 'full' || choice === 'partial'
  const showReturned =
    !!order &&
    !!choice &&
    returnedOffered(order.status, paymentStatusAfter(choice, order.paymentStatus))
  const canConfirm = !!order && !!choice && (choice !== 'partial' || partialValid) && !loading

  const handleConfirm = useCallback(async () => {
    if (!order || !choice) return
    setLoading(true)
    setStatus('')

    // 1. Refund (or only "goods are back") on the order.
    let refundedCents: number | undefined
    const wantsReturned = showReturned && markReturned
    if (refunds || wantsReturned) {
      const result = await refundOrder({
        sanityClient,
        frontendClient,
        order,
        expected: refundSnapshot(order),
        refund: choice === 'closeOnly' ? 'none' : choice,
        ...(choice === 'partial' && { amountCents: partialCents }),
        markReturned: wantsReturned,
      })
      if (!result.ok) {
        setStatus(refundErrorText(result, t))
        setLoading(false)
        return
      }
      refundedCents = result.refundedCents
    }

    // 2. Close the withdrawal (a partial refund too: the shop keeps the rest).
    try {
      await sanityClient.patch(withdrawalId).set({ status: 'refunded' }).commit()
    } catch (err) {
      setStatus(
        t(
          'actions.orderWithdrawal.resolve.closeFailed',
          'The order is updated, but the withdrawal could not be closed ({{message}}) — press “Refund & close” again; it then only closes.',
          { message: errorMessage(err) },
        ),
      )
      setLoading(false)
      return
    }

    // 3. Refund mail (only when we just refunded).
    if (notify && refunds) {
      const r = await frontendClient.notifyOrder(
        choice === 'full' ? 'orderRefunded' : 'orderRefundedPartially',
        order._id,
        { ...(typeof refundedCents === 'number' && { refundAmount: refundedCents }) },
      )
      if (r.error) {
        setStatus(t('actions.order.error', 'Mail failed: {{message}}', { message: r.error }))
        setLoading(false)
        return
      }
    }

    setLoading(false)
    toast.push({
      status: 'success',
      title:
        refunds && typeof refundedCents === 'number'
          ? t(
              'actions.orderWithdrawal.resolve.successRefund',
              '{{amount}} refunded, withdrawal closed',
              {
                amount: format.currency(refundedCents / 100),
              },
            )
          : t('actions.orderWithdrawal.resolve.successClosed', 'Withdrawal closed'),
    })
    onComplete()
  }, [
    format,
    toast,
    order,
    choice,
    refunds,
    showReturned,
    markReturned,
    partialCents,
    notify,
    withdrawalId,
    sanityClient,
    frontendClient,
    t,
    onComplete,
  ])

  if (!order) {
    return (
      <Box padding={4}>
        <Text>{t('ui.loading', 'Loading…')}</Text>
      </Box>
    )
  }

  const { options } = resolveOptions(order)
  const money = (cents: number) => format.currency(cents / 100)
  const alreadyRefunded = order.paymentStatus === 'refunded'
  const optionLabel = (o: ResolveChoice) => {
    switch (o) {
      case 'full':
        return t('actions.orderWithdrawal.resolve.full', 'Full refund (rest {{amount}})', {
          amount: money(remaining),
        })
      case 'partial':
        return t('actions.orderWithdrawal.resolve.partial', 'Partial refund')
      default:
        return t(
          'actions.orderWithdrawal.resolve.closeOnly',
          'Close only ({{amount}} already refunded, no further refund)',
          { amount: money(refundedTotal(order.refunds)) },
        )
    }
  }

  return (
    <Stack padding={4} gap={4}>
      {alreadyRefunded ? (
        <Text>
          {t(
            'actions.orderWithdrawal.resolve.alreadyRefunded',
            'The order is already refunded. This will close the withdrawal.',
          )}
        </Text>
      ) : (
        <fieldset style={{ border: 0, margin: 0, padding: 0, minInlineSize: 0 }}>
          <legend style={{ padding: 0, marginBottom: '0.75rem' }}>
            <Text weight="semibold">
              {t('actions.orderWithdrawal.resolve.choiceLegend', 'Refund')}
            </Text>
          </legend>
          <Stack gap={3}>
            {options.map((o) => (
              <Stack key={o} gap={2}>
                <Flex align="center" gap={2}>
                  <Radio
                    id={`resolve-choice-${o}`}
                    name="resolve-choice"
                    value={o}
                    checked={choice === o}
                    onChange={handleChoice}
                    aria-describedby={o === 'partial' ? 'resolve-partial-hint' : undefined}
                  />
                  <Box flex={1}>
                    <Text>
                      <label htmlFor={`resolve-choice-${o}`}>{optionLabel(o)}</label>
                    </Text>
                  </Box>
                </Flex>
                {o === 'partial' && (
                  <Box paddingLeft={4}>
                    <Text size={1} muted id="resolve-partial-hint">
                      {t(
                        'actions.orderWithdrawal.resolve.partialHint',
                        'The withdrawal is closed; the rest is not refunded.',
                      )}
                    </Text>
                  </Box>
                )}
              </Stack>
            ))}
          </Stack>
        </fieldset>
      )}

      {choice === 'partial' && (
        <Stack gap={2}>
          <Text size={1} weight="medium">
            <label htmlFor="resolve-refund-amount-input">
              {t('actions.order.updateStatus.refundAmountLabel', 'Refund amount (€)')}
            </label>
          </Text>
          <TextInput
            id="resolve-refund-amount-input"
            type="number"
            min={0}
            step="0.01"
            value={partialAmount ?? ''}
            onChange={handleAmountChange}
            aria-invalid={partialAmount !== undefined && !partialValid}
            aria-describedby={partialValid ? undefined : 'resolve-refund-amount-hint'}
          />
          {!partialValid && (
            <Text size={1} muted id="resolve-refund-amount-hint">
              {t(
                'actions.order.updateStatus.enterAmountBelowRemaining',
                'Enter an amount below the remaining {{remaining}} — choose “Refunded” for the whole rest',
                { remaining: money(remaining) },
              )}
            </Text>
          )}
        </Stack>
      )}

      {showReturned && (
        <Flex align="center" gap={2}>
          <Checkbox
            id="resolve-returned-checkbox"
            checked={markReturned}
            onChange={handleMarkReturnedChange}
          />
          <Box flex={1}>
            <Text>
              <label htmlFor="resolve-returned-checkbox">
                {t(
                  'actions.orderWithdrawal.resolve.markReturned',
                  'Goods are back (order → “Returned”)',
                )}
              </label>
            </Text>
          </Box>
        </Flex>
      )}

      {refunds && (
        <Flex align="center" gap={2}>
          <Checkbox id="resolve-notify-checkbox" checked={notify} onChange={handleNotifyChange} />
          <Box flex={1}>
            <Text>
              <label htmlFor="resolve-notify-checkbox">
                {t('actions.orderWithdrawal.resolve.notify', 'Send refund confirmation email')}
              </label>
            </Text>
          </Box>
        </Flex>
      )}

      <Flex gap={2} justify="flex-end">
        <Button mode="ghost" text={t('ui.dialog.cancel', 'Cancel')} onClick={onComplete} />
        <Button
          tone="primary"
          text={t('ui.dialog.confirm', 'Confirm')}
          loading={loading}
          disabled={!canConfirm}
          onClick={handleConfirm}
        />
      </Flex>

      <StatusLine status={status} />
    </Stack>
  )
}
