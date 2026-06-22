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
import { EnvelopeIcon } from '@sanity/icons'
import { OrderWithdrawalIcon } from '../../assets/icons'
import { Box, Button, Checkbox, Flex, Stack, Text, TextArea, TextInput, useToast } from '@sanity/ui'
import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import type { DocumentActionDescription, DocumentActionProps, SanityClient } from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'

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
