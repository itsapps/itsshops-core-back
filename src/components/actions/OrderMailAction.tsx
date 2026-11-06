/**
 * Manual mail picker document action for orders.
 *
 * Unlike `OrderActions` (which drives state machine transitions and sends an
 * automatic mail for the new state), this action is purely a side effect: it
 * lets an admin pick any `MailType` from a dropdown and send it on demand —
 * useful for re-sending a confirmation, sending the invoice PDF, etc.
 *
 * No document patch, no statusHistory entry — just a notify call (with an
 * optional personal message shown in the mail).
 */
import { SendMailIcon } from '../../assets/icons'
import { Box, Button, Card, Checkbox, Flex, Select, Stack, Text, TextInput } from '@sanity/ui'
import type { ChangeEvent } from 'react'
import { useCallback, useState } from 'react'
import type { DocumentActionDescription, DocumentActionProps } from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'
import { CustomerMessageField } from './OrderActions'
import type { MailType } from '../../utils/orderTransitions'

const MAIL_TYPES: MailType[] = [
  'orderConfirmation',
  'orderProcessing',
  'orderInvoice',
  'orderShipping',
  'orderDelivered',
  'orderReturned',
  'orderCanceled',
  'orderRefunded',
  'orderRefundedPartially',
]

type OrderMailActionDoc = {
  _id: string
  totals?: { grandTotal?: number }
}

export function OrderMailDocumentAction(props: DocumentActionProps): DocumentActionDescription {
  const { published } = props
  const order = published as OrderMailActionDoc | null
  const { componentT } = useITSContext()
  const t = componentT.default
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleOpen = useCallback(() => setDialogOpen(true), [])
  const handleClose = useCallback(() => setDialogOpen(false), [])

  if (!order) {
    return {
      label: t('actions.order.sendMailDialog.title', 'Send mail'),
      icon: SendMailIcon,
      disabled: true,
    }
  }

  return {
    label: t('actions.order.sendMailDialog.title', 'Send mail'),
    icon: SendMailIcon,
    onHandle: handleOpen,
    dialog: dialogOpen && {
      type: 'dialog',
      header: t('actions.order.sendMailDialog.title', 'Send mail'),
      onClose: handleClose,
      content: <OrderMailContent order={order} onComplete={handleClose} />,
    },
  }
}

function OrderMailContent({
  order,
  onComplete,
}: {
  order: OrderMailActionDoc
  onComplete: () => void
}) {
  const { componentT, frontendClient, featureRegistry } = useITSContext()
  const t = componentT.default
  // Invoices issued elsewhere (features.shop.invoices: false): no invoice mail, no PDF.
  const invoicesOn = featureRegistry.isFeatureEnabled('shop.invoices')
  const mailTypes = invoicesOn ? MAIL_TYPES : MAIL_TYPES.filter((type) => type !== 'orderInvoice')

  const [mailType, setMailType] = useState<MailType>('orderConfirmation')
  const [attachInvoice, setAttachInvoice] = useState(false)
  const [customerMessage, setCustomerMessage] = useState('')
  // The order doesn't store refunded amounts: a partial-refund mail needs the amount typed in
  // (the notify function refuses one without it — it would otherwise state the order total).
  const [partialAmount, setPartialAmount] = useState<number | undefined>()
  const grandTotal = order.totals?.grandTotal ?? 0
  const isPartialRefundMail = mailType === 'orderRefundedPartially'
  const partialAmountCents =
    partialAmount !== undefined && !Number.isNaN(partialAmount)
      ? Math.round(partialAmount * 100)
      : undefined
  const isPartialAmountValid =
    partialAmountCents !== undefined && partialAmountCents > 0 && partialAmountCents <= grandTotal
  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      setPartialAmount(e.currentTarget.value === '' ? undefined : Number(e.currentTarget.value)),
    [],
  )
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>('')

  const handleMailTypeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => setMailType(e.currentTarget.value as MailType),
    [],
  )
  const handleAttachInvoiceChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setAttachInvoice(e.currentTarget.checked),
    [],
  )

  const handleCustomerMessageChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setCustomerMessage(e.currentTarget.value),
    [],
  )

  const handleSend = useCallback(async () => {
    setLoading(true)
    setStatus('')
    const trimmedCustomerMessage = customerMessage.trim()
    const result = await frontendClient.notifyOrder(mailType, order._id, {
      attachInvoice,
      ...(isPartialRefundMail &&
        partialAmountCents !== undefined && { refundAmount: partialAmountCents }),
      ...(trimmedCustomerMessage && { customerMessage: trimmedCustomerMessage }),
    })
    if (result.error) {
      setStatus(`${t('actions.order.error', 'Mail failed', { message: result.error })}`)
      setLoading(false)
      return
    }
    setStatus(t('actions.order.sendMailSuccess', 'Customer notified'))
    setLoading(false)
    onComplete()
  }, [
    frontendClient,
    mailType,
    order._id,
    attachInvoice,
    customerMessage,
    t,
    onComplete,
    isPartialRefundMail,
    partialAmountCents,
  ])

  return (
    <Stack padding={4} gap={4}>
      <Stack gap={2}>
        <Text weight="bold">
          <label htmlFor="order-mail-type-select">
            {t('actions.order.sendMailDialog.selectMailType', 'Select mail type')}
          </label>
        </Text>
        <Select id="order-mail-type-select" value={mailType} onChange={handleMailTypeChange}>
          {mailTypes.map((type) => (
            <option key={type} value={type}>
              {t(`actions.order.mailTypes.${type}`, type)}
            </option>
          ))}
        </Select>
      </Stack>

      {isPartialRefundMail && (
        <Stack gap={2}>
          <Text size={1} weight="medium">
            <label htmlFor="order-mail-refund-amount-input">
              {t('actions.order.updateStatus.refundAmountLabel', 'Refund amount (€)')}
            </label>
          </Text>
          <TextInput
            id="order-mail-refund-amount-input"
            type="number"
            min={0}
            step="0.01"
            value={partialAmount ?? ''}
            onChange={handleAmountChange}
            placeholder={t('actions.order.updateStatus.refundAmount', 'Refund amount')}
            aria-invalid={partialAmount !== undefined && !isPartialAmountValid}
            aria-describedby={isPartialAmountValid ? undefined : 'order-mail-refund-amount-hint'}
          />
          {!isPartialAmountValid && (
            <Text size={1} muted id="order-mail-refund-amount-hint">
              {t('actions.order.updateStatus.enterValidAmount', 'Enter a valid amount')}
            </Text>
          )}
        </Stack>
      )}

      {invoicesOn && (
        <Flex align="center" gap={2}>
          <Checkbox
            id="attach-invoice-checkbox"
            checked={attachInvoice}
            onChange={handleAttachInvoiceChange}
          />
          <Box flex={1}>
            <Text>
              <label htmlFor="attach-invoice-checkbox">
                {t('actions.order.sendMailDialog.attachInvoice', 'Attach invoice PDF')}
              </label>
            </Text>
          </Box>
        </Flex>
      )}

      <CustomerMessageField value={customerMessage} onChange={handleCustomerMessageChange} />

      <Flex gap={2} justify="flex-end">
        <Button mode="ghost" text={t('ui.dialog.cancel', 'Cancel')} onClick={onComplete} />
        <Button
          tone="primary"
          text={t('actions.order.sendMailDialog.send', 'Send')}
          loading={loading}
          disabled={loading || (isPartialRefundMail && !isPartialAmountValid)}
          onClick={handleSend}
        />
      </Flex>

      {status && (
        <Card padding={3} radius={2} tone="transparent">
          <Text size={1}>{status}</Text>
        </Card>
      )}
    </Stack>
  )
}
