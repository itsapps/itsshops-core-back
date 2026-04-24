/**
 * Document action that drives order fulfillment + payment status transitions.
 *
 * Orders are not edited directly: `status` and `paymentStatus` are read-only on
 * the schema. Instead, this action surfaces the legal next states from the
 * state machine in `utils/orderTransitions.ts` and walks the admin through:
 *
 *   1. pick a target state (fulfillment or payment)
 *   2. for partial refunds: enter an amount
 *   3. optionally notify the customer
 *   4. confirm
 *
 * On confirm:
 *   - if a refund: call `frontendClient.refundPayment` first; bail on failure
 *   - patch the order document (set new status + append statusHistory)
 *   - if notifyCustomer: call `frontendClient.notifyOrder` with the matching
 *     mailType from `mailTypeForStatus`
 *
 * The Stripe webhook also reconciles the paymentStatus, so direct patches and
 * webhook updates must remain idempotent — both paths set the same fields.
 */
import { CheckmarkCircleIcon } from '@sanity/icons'
import { Box, Button, Checkbox, Flex, Stack, Text, TextArea, TextInput } from '@sanity/ui'
import type { ChangeEvent } from 'react'
import { useCallback, useState } from 'react'
import type { DocumentActionDescription, DocumentActionProps } from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'
import {
  getAllowedFulfillmentTransitions,
  getAllowedPaymentTransitions,
  mailTypeForStatus,
  type OrderPaymentStatus,
  type OrderStatus,
  type StatusAction,
} from '../../utils/orderTransitions'

type OrderActionDoc = {
  _id: string
  status: OrderStatus
  paymentStatus: OrderPaymentStatus
  paymentIntentId: string
  totals?: { grandTotal?: number }
  customer?: { locale?: string }
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

export function OrderDocumentAction(props: DocumentActionProps): DocumentActionDescription | null {
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
      icon: CheckmarkCircleIcon,
      disabled: true,
    }
  }

  const { fulfillmentActions, paymentActions } = buildActions(order, t)

  return {
    label: t('actions.order.updateStatus.title', 'Update status'),
    icon: CheckmarkCircleIcon,
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
  const [partialAmount, setPartialAmount] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>('')

  const isPartialRefund = selectedAction?.newState === 'partiallyRefunded'
  const grandTotal = order.totals?.grandTotal ?? 0
  const isPartialRefundValid =
    partialAmount !== undefined && partialAmount > 0 && partialAmount * 100 <= grandTotal
  const notificationMailType = mailTypeForStatus(selectedAction?.newState)

  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setPartialAmount(Number(e.currentTarget.value)),
    [],
  )
  const handleNoteChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setNote(e.currentTarget.value),
    [],
  )
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
      ...(note && { note }),
    }

    try {
      await sanityClient
        .patch(order._id)
        .set({
          [selectedAction.type === 'fulfillment' ? 'status' : 'paymentStatus']:
            selectedAction.newState,
        })
        .append('statusHistory', [historyEntry])
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
    if (notifyCustomer && notificationMailType) {
      const result = await frontendClient.notifyOrder(notificationMailType, order._id)
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
    isPartialRefund,
    isPartialRefundValid,
    partialAmount,
    note,
    notifyCustomer,
    notificationMailType,
    t,
    onComplete,
  ])

  return (
    <Stack padding={4} space={4}>
      {fulfillmentActions.length > 0 && (
        <>
          <Text weight="bold">{t('order.status.title', 'Fulfillment status')}</Text>
          <Flex gap={2} wrap="wrap">
            {fulfillmentActions.map((action) => (
              <TransitionButton
                key={action.newState}
                action={action}
                selected={selectedAction?.newState === action.newState}
                onSelect={setSelectedAction}
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
                onSelect={setSelectedAction}
              />
            ))}
          </Flex>
        </>
      )}

      {isPartialRefund && (
        <Stack space={2}>
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

      <TextArea
        rows={3}
        placeholder={t('ui.actions.optionalNote', 'Optional note')}
        value={note}
        onChange={handleNoteChange}
      />

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
