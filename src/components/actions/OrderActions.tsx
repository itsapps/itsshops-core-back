/**
 * Document action that drives order fulfillment + payment status transitions.
 *
 * Orders are not edited directly: `status` and `paymentStatus` are read-only on
 * the schema. Instead, this action surfaces the legal next states from the
 * state machine in `utils/orderTransitions.ts` and walks the admin through:
 *
 *   1. pick a target state (fulfillment or payment)
 *   2. for partial refunds: enter an amount; for `shipped` (delivery orders):
 *      optionally enter/edit the tracking code
 *   3. optionally notify the customer, with an optional personal message
 *      that is shown in the mail
 *   4. optionally add an internal note (status history only, never mailed)
 *   5. confirm
 *
 * On confirm:
 *   - if a refund: call `frontendClient.refundPayment` first; bail on failure
 *   - patch the order document (set new status + append statusHistory, plus
 *     `fulfillment.trackingCode` when shipping) — committed before the mail,
 *     so the shipped mail already shows the tracking code. The history entry
 *     keeps the internal `note` and, when a mail is sent, the `customerMessage`
 *   - if notifyCustomer: call `frontendClient.notifyOrder` with the matching
 *     mailType from `mailTypeForStatus`
 *
 * The Stripe webhook also reconciles the paymentStatus, so direct patches and
 * webhook updates must remain idempotent — both paths set the same fields.
 */
import { ConfirmIcon } from '../../assets/icons'
import { Box, Button, Checkbox, Flex, Stack, Text, TextArea, TextInput } from '@sanity/ui'
import type { ChangeEvent, JSX } from 'react'
import { useCallback, useState } from 'react'
import type { DocumentActionDescription, DocumentActionProps } from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'
import {
  getAllowedFulfillmentTransitions,
  getAllowedPaymentTransitions,
  mailTypeForStatus,
  notifyCustomerByDefault,
  refundCancelsFulfillment,
  type OrderPaymentStatus,
  type OrderStatus,
  type StatusAction,
} from '../../utils/orderTransitions'

/** Same limit as core-front's order-notify function (`CUSTOMER_MESSAGE_MAX_LENGTH`). */
export const CUSTOMER_MESSAGE_MAX_LENGTH = 2000

type OrderActionDoc = {
  _id: string
  status: OrderStatus
  paymentStatus: OrderPaymentStatus
  paymentIntentId: string
  totals?: { grandTotal?: number }
  customer?: { locale?: string }
  fulfillment?: { methodType?: 'delivery' | 'pickup'; trackingCode?: string }
}

function buildActions(
  order: OrderActionDoc,
  t: (key: string, fallback?: string) => string,
): { fulfillmentActions: StatusAction[]; paymentActions: StatusAction[] } {
  const fulfillmentActions: StatusAction[] = getAllowedFulfillmentTransitions(
    order.status,
    order.paymentStatus,
  ).map((newState) => ({
    type: 'fulfillment',
    newState,
    label: t(`order.status.options.${newState}`, newState),
  }))

  const paymentActions: StatusAction[] = getAllowedPaymentTransitions(order.paymentStatus).map(
    (newState) => ({
      type: 'payment',
      newState,
      label: t(`order.paymentStatus.options.${newState}`, newState),
    }),
  )

  return { fulfillmentActions, paymentActions }
}

export function OrderDocumentAction(props: DocumentActionProps): DocumentActionDescription {
  const { published } = props
  const order = published as OrderActionDoc | null
  const { componentT } = useITSContext()
  const t = componentT.default
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleOpen = useCallback(() => setDialogOpen(true), [])
  const handleClose = useCallback(() => setDialogOpen(false), [])

  if (!order) {
    return {
      label: t('actions.order.updateStatus.title', 'Update status'),
      icon: ConfirmIcon,
      disabled: true,
    }
  }

  const { fulfillmentActions, paymentActions } = buildActions(order, t)

  return {
    label: t('actions.order.updateStatus.title', 'Update status'),
    icon: ConfirmIcon,
    disabled: fulfillmentActions.length === 0 && paymentActions.length === 0,
    onHandle: handleOpen,
    dialog: dialogOpen && {
      type: 'dialog',
      header: t('actions.order.updateStatus.title', 'Update status'),
      onClose: handleClose,
      content: (
        <OrderActionContent
          order={order}
          fulfillmentActions={fulfillmentActions}
          paymentActions={paymentActions}
          onComplete={handleClose}
        />
      ),
    },
  }
}

function OrderActionContent({
  order,
  fulfillmentActions,
  paymentActions,
  onComplete,
}: {
  order: OrderActionDoc
  fulfillmentActions: StatusAction[]
  paymentActions: StatusAction[]
  onComplete: () => void
}) {
  const { componentT, sanityClient, frontendClient } = useITSContext()
  const t = componentT.default

  const [selectedAction, setSelectedAction] = useState<StatusAction | undefined>()
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [note, setNote] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  const [partialAmount, setPartialAmount] = useState<number | undefined>()
  const [trackingCode, setTrackingCode] = useState(order.fulfillment?.trackingCode ?? '')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>('')

  const isPartialRefund = selectedAction?.newState === 'partiallyRefunded'
  const grandTotal = order.totals?.grandTotal ?? 0
  const isPartialRefundValid =
    partialAmount !== undefined && partialAmount > 0 && partialAmount * 100 <= grandTotal
  const notificationMailType = mailTypeForStatus(selectedAction?.newState)
  const sendsMail = notifyCustomer && !!notificationMailType
  const trimmedNote = note.trim()
  const trimmedCustomerMessage = sendsMail ? customerMessage.trim() : ''
  // Pickup orders have no tracking code (the schema hides the field for them too).
  const showTrackingCode =
    selectedAction?.type === 'fulfillment' &&
    selectedAction.newState === 'shipped' &&
    order.fulfillment?.methodType !== 'pickup'

  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setPartialAmount(Number(e.currentTarget.value)),
    [],
  )
  const handleTrackingCodeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setTrackingCode(e.currentTarget.value),
    [],
  )
  const handleNoteChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.currentTarget.value),
    [],
  )
  const handleCustomerMessageChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setCustomerMessage(e.currentTarget.value),
    [],
  )
  const handleSelectAction = useCallback((action: StatusAction) => {
    setSelectedAction(action)
    setNotifyCustomer(notifyCustomerByDefault(action.newState))
  }, [])
  const handleNotifyChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setNotifyCustomer(e.currentTarget.checked),
    [],
  )

  const handleConfirm = useCallback(async () => {
    if (!selectedAction) return
    setLoading(true)
    setStatus('')

    // 1. Refund first if this is a payment status change
    if (
      selectedAction.type === 'payment' &&
      (selectedAction.newState === 'refunded' || selectedAction.newState === 'partiallyRefunded')
    ) {
      const result = await frontendClient.refundPayment(order.paymentIntentId, {
        ...(isPartialRefund && isPartialRefundValid && { amount: partialAmount! * 100 }),
      })
      if (result.error) {
        setStatus(`${t('actions.refund.error', 'Refund failed', { message: result.error })}`)
        setLoading(false)
        return
      }
      setStatus(t('actions.refund.sendRefundSuccess', 'Refund successful'))
    }

    // 2. Patch the order document with the new state + history entry
    const timestamp = new Date().toISOString()
    const historyEntry = {
      _key: crypto.randomUUID(),
      _type: 'orderStatusHistory' as const,
      type: selectedAction.type,
      status: selectedAction.newState,
      timestamp,
      source: 'admin',
      ...(trimmedNote && { note: trimmedNote }),
      ...(trimmedCustomerMessage && { customerMessage: trimmedCustomerMessage }),
    }

    // Fully refunding a still-undispatched order also cancels fulfillment, so the
    // order doesn't stay stuck reading as `created`/`processing`. Post-dispatch
    // refunds (shipped/delivered) keep their fulfillment status — those can still
    // be marked `returned` later.
    const setFields: Record<string, string> = {
      [selectedAction.type === 'fulfillment' ? 'status' : 'paymentStatus']: selectedAction.newState,
    }
    const historyEntries = [historyEntry]
    if (
      selectedAction.type === 'payment' &&
      selectedAction.newState === 'refunded' &&
      refundCancelsFulfillment(order.status)
    ) {
      setFields.status = 'canceled'
      historyEntries.push({
        _key: crypto.randomUUID(),
        _type: 'orderStatusHistory' as const,
        type: 'fulfillment',
        status: 'canceled',
        timestamp,
        source: 'admin',
        ...(trimmedNote && { note: trimmedNote }),
      })
    }

    // Tracking code is saved in the same patch, before the shipped mail is sent.
    const trimmedTrackingCode = trackingCode.trim()
    const trackingCodeChanged =
      showTrackingCode && trimmedTrackingCode !== (order.fulfillment?.trackingCode ?? '')
    if (trackingCodeChanged && trimmedTrackingCode) {
      setFields['fulfillment.trackingCode'] = trimmedTrackingCode
    }

    try {
      let patch = sanityClient.patch(order._id).set(setFields)
      if (trackingCodeChanged && !trimmedTrackingCode) {
        patch = patch.unset(['fulfillment.trackingCode'])
      }
      await patch
        .append('statusHistory', historyEntries)
        .commit({ autoGenerateArrayKeys: false, returnDocuments: false })
    } catch (err) {
      setStatus(
        `${t('actions.order.error', 'Update failed', { message: err instanceof Error ? err.message : String(err) })}`,
      )
      setLoading(false)
      return
    }

    // 3. Optionally notify the customer.
    // Invoice PDF attachment is handled by the separate OrderMailAction (manual
    // mail picker) — status-transition mails never attach the invoice.
    if (sendsMail) {
      // For refund mails, pass the refunded amount so it can be shown in the email.
      let refundAmount: number | undefined
      if (selectedAction.newState === 'refunded') {
        refundAmount = grandTotal
      } else if (selectedAction.newState === 'partiallyRefunded' && isPartialRefundValid) {
        refundAmount = partialAmount! * 100
      }
      const result = await frontendClient.notifyOrder(notificationMailType, order._id, {
        ...(refundAmount !== undefined && { refundAmount }),
        ...(trimmedCustomerMessage && { customerMessage: trimmedCustomerMessage }),
      })
      if (result.error) {
        setStatus(`${t('actions.order.error', 'Mail failed', { message: result.error })}`)
        setLoading(false)
        return
      }
      setStatus(t('actions.order.sendMailSuccess', 'Customer notified'))
    }

    setLoading(false)
    onComplete()
  }, [
    selectedAction,
    frontendClient,
    sanityClient,
    order,
    grandTotal,
    isPartialRefund,
    isPartialRefundValid,
    partialAmount,
    trackingCode,
    showTrackingCode,
    trimmedNote,
    trimmedCustomerMessage,
    sendsMail,
    notificationMailType,
    t,
    onComplete,
  ])

  return (
    <Stack padding={4} gap={4}>
      {fulfillmentActions.length > 0 && (
        <>
          <Text weight="bold">{t('order.status.title', 'Fulfillment status')}</Text>
          <Flex gap={2} wrap="wrap">
            {fulfillmentActions.map((action) => (
              <TransitionButton
                key={action.newState}
                action={action}
                selected={selectedAction?.newState === action.newState}
                onSelect={handleSelectAction}
              />
            ))}
          </Flex>
        </>
      )}

      {paymentActions.length > 0 && (
        <>
          <Text weight="bold">{t('order.paymentStatus.title', 'Payment status')}</Text>
          <Flex gap={2} wrap="wrap">
            {paymentActions.map((action) => (
              <TransitionButton
                key={action.newState}
                action={action}
                selected={selectedAction?.newState === action.newState}
                onSelect={handleSelectAction}
              />
            ))}
          </Flex>
        </>
      )}

      {isPartialRefund && (
        <Stack gap={2}>
          <TextInput
            type="number"
            value={partialAmount ?? ''}
            onChange={handleAmountChange}
            placeholder={t('actions.order.updateStatus.refundAmount', 'Refund amount')}
          />
          {!isPartialRefundValid && (
            <Text size={1} muted>
              {t('actions.order.updateStatus.enterValidAmount', 'Enter a valid amount')}
            </Text>
          )}
        </Stack>
      )}

      {showTrackingCode && (
        <Stack gap={2}>
          <Text size={1} weight="medium">
            <label htmlFor="order-tracking-code-input">
              {t('order.trackingNumber', 'Tracking number')}
            </label>
          </Text>
          <TextInput
            id="order-tracking-code-input"
            value={trackingCode}
            onChange={handleTrackingCodeChange}
            aria-describedby="order-tracking-code-hint"
          />
          <Text size={1} muted id="order-tracking-code-hint">
            {t(
              'actions.order.updateStatus.trackingCodeHint',
              'Optional — shown in the shipping confirmation',
            )}
          </Text>
        </Stack>
      )}

      {notificationMailType && (
        <Flex align="center" gap={2}>
          <Checkbox
            id="notify-customer-checkbox"
            checked={notifyCustomer}
            onChange={handleNotifyChange}
          />
          <Box flex={1}>
            <Text>
              <label htmlFor="notify-customer-checkbox">
                {t('actions.order.updateStatus.notifyCustomer', 'Notify customer')}
              </label>
            </Text>
          </Box>
        </Flex>
      )}

      {sendsMail && (
        <CustomerMessageField value={customerMessage} onChange={handleCustomerMessageChange} />
      )}

      <Stack gap={2}>
        <Text size={1} weight="medium">
          <label htmlFor="order-internal-note-input">
            {t('actions.order.internalNote', 'Internal note')}
          </label>
        </Text>
        <TextArea
          id="order-internal-note-input"
          rows={2}
          value={note}
          onChange={handleNoteChange}
          aria-describedby="order-internal-note-hint"
        />
        <Text size={1} muted id="order-internal-note-hint">
          {t(
            'actions.order.internalNoteHint',
            'Optional – saved in the status history only, never sent to the customer',
          )}
        </Text>
      </Stack>

      <Flex gap={2} justify="flex-end">
        <Button mode="ghost" text={t('ui.dialog.cancel', 'Cancel')} onClick={onComplete} />
        <Button
          tone="primary"
          text={t('ui.dialog.confirm', 'Confirm')}
          loading={loading}
          disabled={!selectedAction || loading || (isPartialRefund && !isPartialRefundValid)}
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

function TransitionButton({
  action,
  selected,
  onSelect,
}: {
  action: StatusAction
  selected: boolean
  onSelect: (statusAction: StatusAction) => void
}) {
  const handleClick = useCallback(() => onSelect(action), [action, onSelect])
  return (
    <Button tone={selected ? 'primary' : 'default'} onClick={handleClick} text={action.label} />
  )
}

/** Labelled textarea for the optional personal message mailed to the customer. */
export function CustomerMessageField({
  value,
  onChange,
}: {
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}): JSX.Element {
  const { componentT } = useITSContext()
  const t = componentT.default
  return (
    <Stack gap={2}>
      <Text size={1} weight="medium">
        <label htmlFor="order-customer-message-input">
          {t('actions.order.customerMessage', 'Message to customer')}
        </label>
      </Text>
      <TextArea
        id="order-customer-message-input"
        rows={3}
        value={value}
        onChange={onChange}
        maxLength={CUSTOMER_MESSAGE_MAX_LENGTH}
        aria-describedby="order-customer-message-hint"
      />
      <Text size={1} muted id="order-customer-message-hint">
        {t(
          'actions.order.customerMessageHint',
          'Optional – shown in the email below the standard text',
          { max: CUSTOMER_MESSAGE_MAX_LENGTH },
        )}
      </Text>
    </Stack>
  )
}
