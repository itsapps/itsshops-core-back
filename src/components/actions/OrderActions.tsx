/**
 * Document action that drives order fulfillment + payment status transitions.
 *
 * Orders are not edited directly: `status` and `paymentStatus` are read-only on
 * the schema. Instead, this action surfaces the legal next states from the
 * state machine in `utils/orderTransitions.ts` and walks the admin through:
 *
 *   1. pick a target state (fulfillment or payment)
 *   2. for partial refunds: enter an amount (below what's left to refund); for `shipped` (delivery orders):
 *      optionally enter/edit the tracking code
 *   3. optionally notify the customer, with an optional personal message
 *      that is shown in the mail
 *   4. optionally add an internal note (status history only, never mailed)
 *   5. confirm
 *
 * On confirm:
 *   - if a refund: `refundOrder` (`lib/shop/orderRefund.ts`, shared with the withdrawal's
 *     "Refund & close") — refuses when the order changed since the dialog opened, refunds via
 *     `frontendClient.refundPayment`, then patches payment status + history; bail on failure.
 *     An open withdrawal on the order gets a notice pointing to its "Refund & close"
 *   - otherwise patch the order document (set new status + append statusHistory, plus
 *     `fulfillment.trackingCode` when shipping) — committed before the mail,
 *     so the shipped mail already shows the tracking code. The history entry
 *     keeps the internal `note` only; the `customerMessage` lands on the `mail`
 *     history entry core-front appends once the mail is sent
 *   - if notifyCustomer: call `frontendClient.notifyOrder` with the matching
 *     mailType from `mailTypeForStatus`
 *
 * The Stripe webhook also reconciles the paymentStatus, so direct patches and
 * webhook updates must remain idempotent — both paths set the same fields.
 * `order.refunds` is written by core-front only (`payment-refund` + webhooks).
 */
import { ConfirmIcon } from '../../assets/icons'
import { Box, Button, Card, Checkbox, Flex, Stack, Text, TextArea, TextInput } from '@sanity/ui'
import type { ChangeEvent, JSX } from 'react'
import { useCallback, useState } from 'react'
import type { DocumentActionDescription, DocumentActionProps } from 'sanity'
import { IntentLink } from 'sanity/router'
import { useToast } from '@sanity/ui/toast'

import { useITSContext } from '../../context/ITSCoreProvider'
import { refundOrder, refundSnapshot } from '../../lib/shop/orderRefund'
import { refundErrorText, useOpenWithdrawal } from './WithdrawalActions'
import {
  getAllowedFulfillmentTransitions,
  getAllowedPaymentTransitions,
  mailTypeForStatus,
  notifyCustomerByDefault,
  type OrderPaymentStatus,
  type OrderStatus,
  type StatusAction,
} from '../../utils/orderTransitions'
import { remainingAmount } from '../../utils/orderRefunds'

/** Same limit as core-front's order-notify function (`CUSTOMER_MESSAGE_MAX_LENGTH`). */
export const CUSTOMER_MESSAGE_MAX_LENGTH = 2000

type OrderActionDoc = {
  _id: string
  status: OrderStatus
  paymentStatus: OrderPaymentStatus
  paymentIntentId: string
  totals?: { grandTotal?: number }
  refunds?: { amount: number; status?: string; createdAt?: string }[]
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
  const { componentT, sanityClient, frontendClient, format } = useITSContext()
  const t = componentT.default
  const toast = useToast()

  const [selectedAction, setSelectedAction] = useState<StatusAction | undefined>()
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [note, setNote] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  const [partialAmount, setPartialAmount] = useState<number | undefined>()
  const [trackingCode, setTrackingCode] = useState(order.fulfillment?.trackingCode ?? '')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>('')
  // The order as the dialog opened it: `order` is the live published doc, so comparing against
  // it would never see a refund made meanwhile in another tab.
  const [expected] = useState(() => refundSnapshot(order))
  const openWithdrawal = useOpenWithdrawal(order._id)

  const isRefund =
    selectedAction?.type === 'payment' &&
    (selectedAction.newState === 'refunded' || selectedAction.newState === 'partiallyRefunded')
  const isPartialRefund = selectedAction?.newState === 'partiallyRefunded'
  const grandTotal = order.totals?.grandTotal ?? 0
  // What's left to refund. A partial refund must stay below it — the whole rest is "Refunded",
  // otherwise the Studio would set partiallyRefunded while the webhook sets refunded.
  const remaining = remainingAmount(grandTotal, order.refunds)
  // Euros → integer cents: 4.35 * 100 is 434.99999999999994, and Stripe only takes integers.
  const partialAmountCents =
    partialAmount === undefined ? undefined : Math.round(partialAmount * 100)
  const isPartialRefundValid =
    partialAmountCents !== undefined && partialAmountCents > 0 && partialAmountCents < remaining
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
    // Amount Stripe actually refunded — stated in the refund mail.
    let refundedCents: number | undefined

    if (isRefund) {
      // 1a. Refund + order patch (payment status, history; cancel if undispatched).
      const result = await refundOrder({
        sanityClient,
        frontendClient,
        order,
        expected,
        refund: isPartialRefund ? 'partial' : 'full',
        ...(isPartialRefund && isPartialRefundValid && { amountCents: partialAmountCents }),
        ...(trimmedNote && { note: trimmedNote }),
      })
      if (!result.ok) {
        setStatus(refundErrorText(result, t))
        setLoading(false)
        return
      }
      refundedCents = result.refundedCents
      setStatus(t('actions.refund.sendRefundSuccess', 'Refund successful'))
    } else {
      // 1b. Fulfillment (or other) transition: patch the new state + history entry.
      const timestamp = new Date().toISOString()
      const historyEntry = {
        _key: crypto.randomUUID(),
        _type: 'orderStatusHistory' as const,
        type: selectedAction.type,
        status: selectedAction.newState,
        timestamp,
        source: 'admin',
        ...(trimmedNote && { note: trimmedNote }),
      }
      const setFields: Record<string, string> = {
        [selectedAction.type === 'fulfillment' ? 'status' : 'paymentStatus']:
          selectedAction.newState,
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
          .append('statusHistory', [historyEntry])
          .commit({ autoGenerateArrayKeys: false, returnDocuments: false })
      } catch (err) {
        setStatus(
          `${t('actions.order.error', 'Update failed', { message: err instanceof Error ? err.message : String(err) })}`,
        )
        setLoading(false)
        return
      }
    }

    // 3. Optionally notify the customer.
    // Invoice PDF attachment is handled by the separate OrderMailAction (manual
    // mail picker) — status-transition mails never attach the invoice.
    if (sendsMail) {
      // For refund mails, pass the amount just refunded so it can be shown in the email.
      const refundAmount = refundedCents
      const result = await frontendClient.notifyOrder(notificationMailType, order._id, {
        ...(refundAmount !== undefined && { refundAmount }),
        ...(trimmedCustomerMessage && { customerMessage: trimmedCustomerMessage }),
      })
      if (result.error) {
        setStatus(`${t('actions.order.error', 'Mail failed', { message: result.error })}`)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    const statusLabel = selectedAction.label
    toast.push({
      status: 'success',
      title: sendsMail
        ? t(
            'actions.order.updateStatus.successMailed',
            'Status “{{status}}” set — customer notified',
            { status: statusLabel },
          )
        : t('actions.order.updateStatus.success', 'Status “{{status}}” set', {
            status: statusLabel,
          }),
    })
    onComplete()
  }, [
    toast,
    selectedAction,
    frontendClient,
    sanityClient,
    order,
    expected,
    isRefund,
    isPartialRefund,
    isPartialRefundValid,
    partialAmountCents,
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

      {isRefund && openWithdrawal && (
        <Card padding={3} radius={2} border tone="caution">
          <Stack gap={3}>
            <Text size={1}>
              {t(
                'actions.order.updateStatus.openWithdrawal',
                'This order has an open withdrawal — handle the refund there (“Refund & close” also closes the withdrawal).',
              )}
            </Text>
            <Text size={1}>
              <IntentLink
                intent="edit"
                params={{ id: openWithdrawal._id, type: 'orderWithdrawal' }}
                onClick={onComplete}
              >
                {t('actions.order.updateStatus.openWithdrawalLink', 'Open the withdrawal')}
              </IntentLink>
            </Text>
          </Stack>
        </Card>
      )}

      {isPartialRefund && (
        <Stack gap={2}>
          <Text size={1} weight="medium">
            <label htmlFor="order-refund-amount-input">
              {t('actions.order.updateStatus.refundAmountLabel', 'Refund amount (€)')}
            </label>
          </Text>
          <TextInput
            id="order-refund-amount-input"
            type="number"
            min={0}
            step="0.01"
            value={partialAmount ?? ''}
            onChange={handleAmountChange}
            placeholder={t('actions.order.updateStatus.refundAmount', 'Refund amount')}
            aria-invalid={partialAmount !== undefined && !isPartialRefundValid}
            aria-describedby={isPartialRefundValid ? undefined : 'order-refund-amount-hint'}
          />
          {!isPartialRefundValid && (
            <Text size={1} muted id="order-refund-amount-hint">
              {t(
                'actions.order.updateStatus.enterAmountBelowRemaining',
                'Enter an amount below the remaining {{remaining}} — choose “Refunded” for the whole rest',
                { remaining: format.currency(remaining / 100) },
              )}
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
