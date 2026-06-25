/**
 * Manual mail picker document action for orders.
 *
 * Unlike `OrderActions` (which drives state machine transitions and sends an
 * automatic mail for the new state), this action is purely a side effect: it
 * lets an admin pick any `MailType` from a dropdown and send it on demand —
 * useful for re-sending a confirmation, sending the invoice PDF, etc.
 *
 * No document patch, no statusHistory entry — just a notify call.
 */
import { EnvelopeIcon } from '@sanity/icons'
import { Box, Button, Card, Checkbox, Flex, Select, Stack, Text } from '@sanity/ui'
import type { ChangeEvent } from 'react'
import { useCallback, useState } from 'react'
import type { DocumentActionDescription, DocumentActionProps } from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'
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
      icon: EnvelopeIcon,
      disabled: true,
    }
  }

  return {
    label: t('actions.order.sendMailDialog.title', 'Send mail'),
    icon: EnvelopeIcon,
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
  const { componentT, frontendClient } = useITSContext()
  const t = componentT.default

  const [mailType, setMailType] = useState<MailType>('orderConfirmation')
  const [attachInvoice, setAttachInvoice] = useState(false)
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

  const handleSend = useCallback(async () => {
    setLoading(true)
    setStatus('')
    const result = await frontendClient.notifyOrder(mailType, order._id, { attachInvoice })
    if (result.error) {
      setStatus(`${t('actions.order.error', 'Mail failed', { message: result.error })}`)
      setLoading(false)
      return
    }
    setStatus(t('actions.order.sendMailSuccess', 'Customer notified'))
    setLoading(false)
    onComplete()
  }, [frontendClient, mailType, order._id, attachInvoice, t, onComplete])

  return (
    <Stack padding={4} space={4}>
      <Stack space={2}>
        <Text weight="bold">
          {t('actions.order.sendMailDialog.selectMailType', 'Select mail type')}
        </Text>
        <Select value={mailType} onChange={handleMailTypeChange}>
          {MAIL_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`actions.order.mailTypes.${type}`, type)}
            </option>
          ))}
        </Select>
      </Stack>

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

      <Flex gap={2} justify="flex-end">
        <Button mode="ghost" text={t('ui.dialog.cancel', 'Cancel')} onClick={onComplete} />
        <Button
          tone="primary"
          text={t('actions.order.sendMailDialog.send', 'Send')}
          loading={loading}
          disabled={loading}
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
