/**
 * Withdrawal ("Widerruf") document actions.
 *
 *  - `OrderWithdrawalCreateAction` (on `order`): log a withdrawal received
 *    offline (phone/letter). Opens a dialog for reason + declared date + a
 *    "notify customer" checkbox (default on). On confirm it creates the
 *    `orderWithdrawal` record (the readOnly orderRef is set programmatically)
 *    and, if checked, triggers the customer confirmation email.
 *
 *  - `WithdrawalResendAction` (on `orderWithdrawal`): resend the customer
 *    confirmation for an existing record (e.g. after a delivery failure).
 *
 * Both email paths go through `frontendClient.withdrawNotify`, which sends the
 * customer-facing mail only (the shop already knows).
 */
import { CheckmarkCircleIcon, EnvelopeIcon } from '@sanity/icons'
import { OrderWithdrawalIcon } from '../../assets/icons'
import { Box, Button, Checkbox, Flex, Stack, Text, TextArea, TextInput, useToast } from '@sanity/ui'
import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { DocumentActionDescription, DocumentActionProps, SanityClient } from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'
import { refundCancelsFulfillment } from '../../utils/orderTransitions'

const OPEN_WITHDRAWAL_QUERY = `count(*[_type == "orderWithdrawal" && orderRef._ref == $id && status in ["received", "processing"]])`

/** Check whether an order already has an open (received|processing) withdrawal. */
async function hasOpenWithdrawal(client: SanityClient, orderId: string): Promise<boolean> {
  const cleanId = orderId.replace(/^drafts\./, '')
  const count = await client.fetch<number>(OPEN_WITHDRAWAL_QUERY, { id: cleanId })
  return count > 0
}

/** Live flag: does the order have an open withdrawal? Refetches on dataset changes. */
function useHasOpenWithdrawal(orderId: string | undefined): boolean {
  const { sanityClient } = useITSContext()
  const [open, setOpen] = useState(false)
  const cleanId = orderId?.replace(/^drafts\./, '')

  useEffect(() => {
    if (!cleanId) return undefined

    let active = true
    const load = () => {
      hasOpenWithdrawal(sanityClient, cleanId).then((v) => {
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

export function OrderWithdrawalCreateAction(
  props: DocumentActionProps,
): DocumentActionDescription | null {
  const order = props.published as { _id: string } | null
  const { componentT } = useITSContext()
  const t = componentT.default
  const [dialogOpen, setDialogOpen] = useState(false)
  const openExists = useHasOpenWithdrawal(order?._id)

  const handleOpen = useCallback(() => setDialogOpen(true), [])
  const handleClose = useCallback(() => setDialogOpen(false), [])

  const label = t('actions.orderWithdrawal.create.title', 'Declare withdrawal')

  if (!order) {
    return { label, icon: OrderWithdrawalIcon, disabled: true }
  }

  // Mirror the web endpoint's dedupe: block while an open withdrawal exists.
  // A closed (refunded/rejected) prior one does not block a fresh declaration.
  if (openExists) {
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

  const [reason, setReason] = useState('')
  // `datetime-local` value (YYYY-MM-DDTHH:mm) in local wall-clock, defaulting to now.
  const [dateStr, setDateStr] = useState(() => {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })
  const [notify, setNotify] = useState(true)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

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
    setLoading(true)
    setStatus('')

    // Guard against a race (concurrent admin / double-submit): re-check just
    // before creating, since the action button's disabled state can be stale.
    if (await hasOpenWithdrawal(sanityClient, orderId)) {
      setStatus(
        t(
          'actions.orderWithdrawal.create.alreadyOpen',
          'An open withdrawal already exists for this order',
        ),
      )
      setLoading(false)
      return
    }

    const declaredAt = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString()

    let createdId: string
    try {
      const created = await sanityClient.create({
        _type: 'orderWithdrawal',
        orderRef: { _type: 'reference', _ref: orderId },
        declaredAt,
        status: 'received',
        ...(reason.trim() && { reason: reason.trim() }),
      })
      createdId = created._id
    } catch (err) {
      setStatus(
        `${t('actions.orderWithdrawal.create.error', 'Could not create the withdrawal')}: ${err instanceof Error ? err.message : String(err)}`,
      )
      setLoading(false)
      return
    }

    if (notify) {
      const result = await frontendClient.withdrawNotify(createdId)
      if (result.error) {
        setStatus(
          `${t('actions.orderWithdrawal.notifyError', 'Saved, but the email could not be sent')}: ${result.error}`,
        )
        setLoading(false)
        return
      }
    }

    setLoading(false)
    onComplete()
  }, [dateStr, reason, notify, orderId, sanityClient, frontendClient, t, onComplete])

  return (
    <Stack padding={4} space={4}>
      <Stack space={2}>
        <Text size={1} weight="semibold">
          {t('actions.orderWithdrawal.create.declaredAt', 'Declared on')}
        </Text>
        <TextInput type="datetime-local" value={dateStr} onChange={handleDateChange} />
        {dateStr && (
          <Text size={1} muted>
            {format.date(new Date(dateStr), { dateStyle: 'long', timeStyle: 'short' })}
          </Text>
        )}
      </Stack>

      <Stack space={2}>
        <Text size={1} weight="semibold">
          {t('actions.orderWithdrawal.create.reason', 'Reason / affected items (optional)')}
        </Text>
        <TextArea rows={3} value={reason} onChange={handleReasonChange} />
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
          disabled={loading}
          onClick={handleConfirm}
        />
      </Flex>

      {status && (
        <Box marginTop={3}>
          <Text size={1}>{status}</Text>
        </Box>
      )}
    </Stack>
  )
}

export function WithdrawalResendAction(
  props: DocumentActionProps,
): DocumentActionDescription | null {
  const { componentT, frontendClient } = useITSContext()
  const t = componentT.default
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const id = (props.published as { _id: string } | null)?._id

  const handle = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const result = await frontendClient.withdrawNotify(id)
    setLoading(false)
    if (result.error) {
      toast.push({
        status: 'error',
        title: t('actions.orderWithdrawal.resend.error', 'Email could not be sent'),
        description: result.error,
      })
    } else {
      toast.push({
        status: 'success',
        title: t('actions.orderWithdrawal.resend.success', 'Confirmation email sent'),
      })
    }
    props.onComplete()
  }, [id, frontendClient, toast, t, props])

  return {
    label: t('actions.orderWithdrawal.resend.title', 'Resend confirmation'),
    icon: EnvelopeIcon,
    disabled: loading || !id,
    onHandle: handle,
  }
}

type ResolveOrder = {
  _id: string
  orderNumber?: string
  paymentIntentId: string
  status: string
  paymentStatus: string
  grandTotal?: number
}

/**
 * One-click resolution on an open withdrawal: refund the order (unless already
 * refunded) and close the withdrawal as `refunded`. The order-side state follows
 * the normal refund path — a pre-dispatch order is also cancelled; a shipped one
 * stays shipped (markable `returned` later).
 */
export function WithdrawalResolveAction(
  props: DocumentActionProps,
): DocumentActionDescription | null {
  const wd = props.published as {
    _id: string
    status?: string
    orderRef?: { _ref?: string }
  } | null
  const { componentT } = useITSContext()
  const t = componentT.default
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleOpen = useCallback(() => setDialogOpen(true), [])
  const handleClose = useCallback(() => setDialogOpen(false), [])

  const orderId = wd?.orderRef?._ref
  const isOpen = wd?.status === 'received' || wd?.status === 'processing'
  // Only offered on an open withdrawal that still references its order.
  if (!wd || !orderId || !isOpen) return null

  const label = t('actions.orderWithdrawal.resolve.title', 'Refund & close')
  return {
    label,
    icon: CheckmarkCircleIcon,
    onHandle: handleOpen,
    dialog: dialogOpen && {
      type: 'dialog',
      header: label,
      onClose: handleClose,
      content: (
        <ResolveWithdrawalContent
          withdrawalId={wd._id}
          orderId={orderId}
          onComplete={handleClose}
        />
      ),
    },
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

  const [order, setOrder] = useState<ResolveOrder | null>(null)
  const [notify, setNotify] = useState(true)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let active = true
    sanityClient
      .fetch<ResolveOrder | null>(
        `*[_id == $id][0]{ _id, orderNumber, paymentIntentId, status, paymentStatus, "grandTotal": totals.grandTotal }`,
        { id: orderId },
      )
      .then((o) => {
        if (active) setOrder(o)
      })
    return () => {
      active = false
    }
  }, [orderId, sanityClient])

  const handleNotifyChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setNotify(e.currentTarget.checked),
    [],
  )

  const alreadyRefunded = order?.paymentStatus === 'refunded'

  const handleConfirm = useCallback(async () => {
    if (!order) return
    setLoading(true)
    setStatus('')

    // 1. Refund (only if not already refunded), then mirror the order-side patch
    //    of the refund action so Studio reflects it immediately.
    if (order.paymentStatus !== 'refunded') {
      const result = await frontendClient.refundPayment(order.paymentIntentId)
      if (result.error) {
        setStatus(`${t('actions.refund.error', 'Refund failed', { message: result.error })}`)
        setLoading(false)
        return
      }
      const timestamp = new Date().toISOString()
      const setFields: Record<string, string> = { paymentStatus: 'refunded' }
      const historyEntries: Array<Record<string, unknown>> = [
        {
          _key: crypto.randomUUID(),
          _type: 'orderStatusHistory',
          type: 'payment',
          status: 'refunded',
          timestamp,
          source: 'admin',
        },
      ]
      if (refundCancelsFulfillment(order.status as never)) {
        setFields.status = 'canceled'
        historyEntries.push({
          _key: crypto.randomUUID(),
          _type: 'orderStatusHistory',
          type: 'fulfillment',
          status: 'canceled',
          timestamp,
          source: 'admin',
        })
      }
      try {
        await sanityClient
          .patch(order._id)
          .set(setFields)
          .append('statusHistory', historyEntries)
          .commit({ autoGenerateArrayKeys: false, returnDocuments: false })
      } catch (err) {
        setStatus(
          `${t('actions.order.error', 'Update failed', { message: err instanceof Error ? err.message : String(err) })}`,
        )
        setLoading(false)
        return
      }
    }

    // 2. Close the withdrawal.
    try {
      await sanityClient.patch(withdrawalId).set({ status: 'refunded' }).commit()
    } catch (err) {
      setStatus(
        `${t('actions.order.error', 'Update failed', { message: err instanceof Error ? err.message : String(err) })}`,
      )
      setLoading(false)
      return
    }

    // 3. Notify the customer of the refund (only when we just refunded).
    if (notify && !alreadyRefunded) {
      const r = await frontendClient.notifyOrder('orderRefunded', order._id, {
        ...(typeof order.grandTotal === 'number' && { refundAmount: order.grandTotal }),
      })
      if (r.error) {
        setStatus(`${t('actions.order.error', 'Mail failed', { message: r.error })}`)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    onComplete()
  }, [order, alreadyRefunded, notify, withdrawalId, sanityClient, frontendClient, t, onComplete])

  if (!order) {
    return (
      <Box padding={4}>
        <Text>{t('ui.loading', 'Loading…')}</Text>
      </Box>
    )
  }

  const amount = typeof order.grandTotal === 'number' ? format.currency(order.grandTotal / 100) : ''

  return (
    <Stack padding={4} space={4}>
      <Text>
        {alreadyRefunded
          ? t(
              'actions.orderWithdrawal.resolve.alreadyRefunded',
              'The order is already refunded. This will close the withdrawal.',
            )
          : t(
              'actions.orderWithdrawal.resolve.intro',
              'This will refund {{amount}} to the customer and close the withdrawal.',
              { amount },
            )}
      </Text>

      {!alreadyRefunded && (
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
          disabled={loading}
          onClick={handleConfirm}
        />
      </Flex>

      {status && (
        <Box marginTop={3}>
          <Text size={1}>{status}</Text>
        </Box>
      )}
    </Stack>
  )
}
