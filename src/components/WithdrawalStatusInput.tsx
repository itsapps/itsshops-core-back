/**
 * `status` field of an `orderWithdrawal` (the document is `liveEdit`, so a change saves at once).
 *
 * - Offers `received` / `processing` / `rejected` only. `unmatched` (left by "Assign order") and
 *   `refunded` (set by "Refund & close", the action that actually refunds) render read-only.
 * - Choosing `rejected` asks for an internal reason first; the patch appends
 *   "Rejected on 〈date〉: 〈reason〉" to `note`.
 * - Reopening a rejected one (→ received / processing) is refused while the order has another
 *   open withdrawal.
 *
 * Writes go through `useDocumentOperation(…).patch` (the rejection also sets `note`, which a
 * field input can't reach via `onChange`).
 */
import { Box, Button, Card, Flex, Select, Stack, Text, TextArea } from '@sanity/ui'
import type { ChangeEvent } from 'react'
import { useCallback, useState } from 'react'
import { type StringInputProps, useDocumentOperation, useFormValue } from 'sanity'

import { useITSContext } from '../context/ITSCoreProvider'
import { OPEN_STATUSES } from '../utils/withdrawals'

const SELECTABLE = ['received', 'processing', 'rejected'] as const

export function WithdrawalStatusInput(props: StringInputProps) {
  const { value, readOnly, id: inputId } = props
  const { componentT, sanityClient, format } = useITSContext()
  const t = componentT.default

  const documentId = String(useFormValue(['_id']) ?? '').replace(/^drafts\./, '')
  const orderId = (useFormValue(['orderRef']) as { _ref?: string } | undefined)?._ref
  const note = useFormValue(['note']) as string | undefined
  const { patch } = useDocumentOperation(documentId, 'orderWithdrawal')

  const [pendingReject, setPendingReject] = useState(false)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const statusLabel = (status: string) => t(`order.withdrawals.status.${status}`, status)

  const handleSelect = useCallback(
    async (e: ChangeEvent<HTMLSelectElement>) => {
      const next = e.currentTarget.value
      setMessage('')
      if (next === value) {
        setPendingReject(false)
        return
      }
      if (next === 'rejected') {
        setPendingReject(true)
        return
      }
      setPendingReject(false)
      if (value === 'rejected' && orderId) {
        // Reopening: only while the order has no other open withdrawal.
        setBusy(true)
        const others = await sanityClient.fetch<number>(
          `count(*[_type == "orderWithdrawal" && orderRef._ref == $order && status in $open && !(_id in [$self, "drafts." + $self])])`,
          { order: orderId, open: OPEN_STATUSES, self: documentId },
        )
        setBusy(false)
        if (others > 0) {
          setMessage(
            t(
              'actions.orderWithdrawal.create.alreadyOpen',
              'An open withdrawal already exists for this order',
            ),
          )
          return
        }
      }
      patch.execute([{ set: { status: next } }])
    },
    [value, orderId, documentId, sanityClient, patch, t],
  )

  const handleReasonChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setReason(e.currentTarget.value),
    [],
  )
  const handleCancelReject = useCallback(() => {
    setPendingReject(false)
    setReason('')
  }, [])
  const handleReject = useCallback(() => {
    const trimmed = reason.trim()
    if (!trimmed) return
    const line = t(
      'actions.orderWithdrawal.status.rejectedNote',
      'Rejected on {{date}}: {{reason}}',
      {
        date: format.date(new Date(), { dateStyle: 'medium' }),
        reason: trimmed,
      },
    )
    patch.execute([
      { set: { status: 'rejected', note: [note?.trim(), line].filter(Boolean).join('\n') } },
    ])
    setPendingReject(false)
    setReason('')
  }, [reason, note, patch, format, t])

  // unmatched / refunded (and an empty value) aren't chosen here.
  if (readOnly || !value || !(SELECTABLE as readonly string[]).includes(value)) {
    return (
      <Card padding={3} radius={2} border tone="transparent">
        <Text size={1}>{value ? statusLabel(value) : '—'}</Text>
      </Card>
    )
  }

  const selectValue = pendingReject ? 'rejected' : value
  return (
    <Stack gap={3}>
      <Select
        id={inputId}
        value={selectValue}
        disabled={busy}
        onChange={handleSelect}
        aria-describedby={message ? `${inputId}-message` : undefined}
      >
        {SELECTABLE.map((s) => (
          <option key={s} value={s}>
            {statusLabel(s)}
          </option>
        ))}
      </Select>

      {pendingReject && (
        <Card padding={3} radius={2} border tone="caution">
          <Stack gap={3}>
            <Text size={1} weight="semibold">
              <label htmlFor={`${inputId}-reject-reason`}>
                {t('actions.orderWithdrawal.status.rejectReason', 'Reason (internal)')}
              </label>
            </Text>
            <TextArea
              id={`${inputId}-reject-reason`}
              rows={2}
              required
              value={reason}
              onChange={handleReasonChange}
              aria-describedby={`${inputId}-reject-hint`}
            />
            <Text size={1} muted id={`${inputId}-reject-hint`}>
              {t(
                'actions.orderWithdrawal.status.rejectHint',
                'Saved in the internal note. Telling the customer is up to you.',
              )}
            </Text>
            <Flex gap={2} justify="flex-end">
              <Button
                mode="ghost"
                text={t('ui.dialog.cancel', 'Cancel')}
                onClick={handleCancelReject}
              />
              <Button
                tone="critical"
                text={t('actions.orderWithdrawal.status.reject', 'Reject')}
                disabled={!reason.trim()}
                onClick={handleReject}
              />
            </Flex>
          </Stack>
        </Card>
      )}

      <Box aria-live="polite" id={`${inputId}-message`}>
        {message && (
          <Text size={1} accent>
            {message}
          </Text>
        )}
      </Box>
    </Stack>
  )
}
