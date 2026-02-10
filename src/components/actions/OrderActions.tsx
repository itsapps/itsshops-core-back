import { useITSContext } from '../../context/ITSCoreProvider'
import { Order, StatusHistoryEntry, OrderPaymentStatus, OrderStatus, StatusAction } from '../../types'

import React, { useState } from 'react'
import { Dialog, Flex, Stack, Text, TextArea, Button, Checkbox, TextInput, Box } from '@sanity/ui'
import {
  DocumentActionDescription,
  DocumentActionProps,
} from 'sanity'
import { CheckCircle } from 'phosphor-react'

import {
  getFullfillmentActions,
  mailTypeForStatus,
} from '../../utils/orders'



export function OrderActions(
  {order, onComplete, selectedFullfillmentStatus}:
  {order: Order, onComplete: () => void, selectedFullfillmentStatus: OrderStatus}) {
  const { t } = useITSContext();
  const {fulfillmentActions, paymentActions} = getFullfillmentActions(order, t)
  const statusAction = fulfillmentActions.find(a => a.newState === selectedFullfillmentStatus)

  return (
    <Dialog
      id="order-action-dialog"
      header={t('actions.order.updateStatus.title')}
      zOffset={1000}
      onClose={() => onComplete()}
      width={1}
    >
      <OrderActionContent
        order={order}
        onComplete={onComplete}
        fulfillementActions={fulfillmentActions}
        paymentActions={paymentActions}
        selectedFullfillmentStatusAction={statusAction}
      />
    </Dialog>
  )
}

export function OrderDocumentActions(props: DocumentActionProps): DocumentActionDescription {
  const { published } = props
  const order = published as Order | null
  const { t } = useITSContext();
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!order) return { label: t('actions.order.updateStatus.title'), disabled: true }

  const {fulfillmentActions, paymentActions} = getFullfillmentActions(order, t)
  return {
    label: t('actions.order.updateStatus.title'),
    icon: CheckCircle,
    disabled: fulfillmentActions.length === 0 && paymentActions.length === 0,
    onHandle: () => setDialogOpen(true),
    dialog: dialogOpen && {
      type: 'dialog',
      header: t('actions.order.updateStatus.title'),
      onClose: () => setDialogOpen(false),
      content: (
        <OrderActionContent
          order={order}
          onComplete={() => {
            setDialogOpen(false);
          }}
          fulfillementActions={fulfillmentActions}
          paymentActions={paymentActions}
          selectedFullfillmentStatusAction={undefined}
        />
      )
    },
  }
}

export function OrderActionContent(
  {
    order,
    onComplete,
    fulfillementActions = [],
    paymentActions = [],
    selectedFullfillmentStatusAction = undefined
  }:
  {
    order: Order,
    onComplete: () => void,
    fulfillementActions: StatusAction[],
    paymentActions: StatusAction[],
    selectedFullfillmentStatusAction: StatusAction | undefined
  }
) {
  const { t, frontendClient, sanityClient } = useITSContext();
  
  const [selectedAction, setSelectedAction] = useState<StatusAction | undefined>(selectedFullfillmentStatusAction)
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [note, setNote] = useState('')
  const [partialAmount, setPartialAmount] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(' ')

  const isPartialRefund = (selectedAction?.newState === 'partiallyRefunded')
  const isPartialRefundValid = (partialAmount !== undefined && partialAmount > 0 && partialAmount*100 <= order.totals.total)
  const notificationMailType = mailTypeForStatus(selectedAction?.newState)

  const handleConfirm = async () => {
    if (!selectedAction) return
    const { type, newState } = selectedAction
    const timestamp = new Date().toISOString()

    setLoading(true)
    setStatus('')

    // Refund via server function if payment update
    if (type === 'payment' && ['refunded', 'partiallyRefunded'].includes(newState)) {
      const result = await frontendClient.sendRefund(order!.paymentIntentId, {...(isPartialRefund && isPartialRefundValid) && {amount: partialAmount*100}})
      if (result.error) {
        setStatus(t('actions.refund.error', {errorMessage: result.error}))
        setLoading(false)
        return
      } else {
        setStatus(t('actions.refund.sendRefundSuccess'))
      }
    }

    // Patch order state and append to history
    let historyStateItem: StatusHistoryEntry;
    if (type === 'fulfillment') {
      historyStateItem = {
        type,
        state: newState as OrderStatus,
        timestamp,
        source: 'admin',
        ...note && { note },
      };
    } else {
      historyStateItem = {
        type,
        state: newState as OrderPaymentStatus,
        timestamp,
        source: 'admin',
        ...note && { note },
      };
    }

    await sanityClient
      .patch(order._id)
      .set({
        [type === 'fulfillment' ? 'status' : 'paymentStatus']: newState,
        ...(isPartialRefund && isPartialRefundValid) && { 'totals.total': order!.totals.total - partialAmount*100 },
        ...(newState === 'refunded') && { 'totals.total': 0 },
      })
      .append('statusHistory', [historyStateItem])
      .commit({ autoGenerateArrayKeys: true, returnDocuments: false });

    // 2️⃣ Send email to customer
    if (notifyCustomer && notificationMailType) {
      const result = await frontendClient.sendMail(notificationMailType, order!._id)
      if (result.error) {
        setLoading(false)
        setStatus(t('actions.order.error', {errorMessage: result.error}))
        return
      } else {
        setStatus(t('actions.order.sendMailSuccess'))
      }
    }

    setLoading(false)
    onComplete()
  }

  return (
    <Stack padding={4} space={4}>
      <Text weight='bold'>{t('order.status.title')}</Text>
      <Flex gap={3}>
        {fulfillementActions.map(action => (
          <Button
            key={action.label}
            tone={selectedAction?.newState === action.newState ? 'primary' : 'default'}
            onClick={() => setSelectedAction(action)}
            style={{ cursor: 'pointer' }}
          >
            {action.label}
          </Button>
        ))}
      </Flex>
      <Text weight='bold'>{t('order.paymentStatus.title')}</Text>
      <Flex gap={2}>
        {paymentActions.map(action => (
          <Button
            key={action.label}
            tone={selectedAction?.newState === action.newState ? 'primary' : 'default'}
            onClick={() => setSelectedAction(action)}
            style={{ cursor: 'pointer' }}
          >
            {action.label}
          </Button>
        ))}
      </Flex>

      {selectedAction?.newState === 'partiallyRefunded' && (
        <>
          <TextInput
            type="number"
            value={partialAmount ?? ''}
            onChange={e => setPartialAmount(Number(e.currentTarget.value))}
            placeholder={t('actions.order.updateStatus.refundAmount')}
          />
          {!isPartialRefundValid && (
            <Box>
              <Text>{t('actions.order.updateStatus.enterValidAmount')}</Text>
            </Box>
          )}
        </>
      )}

      <TextArea
        onChange={e => setNote(e.currentTarget.value)}
        padding={[2]}
        rows={3}
        placeholder={t('ui.actions.optionalNote')}
        value={note}
      />

      {notificationMailType && (
        <Flex align="center">
          <Checkbox
            id="notify-customer-checkbox"
            checked={notifyCustomer}
            onChange={e => setNotifyCustomer(e.currentTarget.checked)}
          />
          <Box flex={1} paddingLeft={3}>
            <Text>
              <label htmlFor="notify-customer-checkbox">{t('actions.order.updateStatus.notifyCustomer')}</label>
            </Text>
          </Box>
        </Flex>
      )}

      <Flex gap={2} justify="flex-end">
        <Button text={t('ui.dialog.cancel')} mode="ghost" onClick={() => onComplete()} />
        <Button text={t('ui.dialog.confirm')} tone="primary" loading={loading} disabled={(!selectedAction || loading || (isPartialRefund && !isPartialRefundValid))} onClick={handleConfirm} />
      </Flex>
      {status && (
        <Box marginTop={3}>
          <Text>{status}</Text>
        </Box>
      )}
    </Stack>
  )
}
