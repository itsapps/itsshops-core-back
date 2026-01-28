
import { Order, OrderStatus } from '../types/orders'
import { useITSContext } from '../context/ITSCoreProvider'

import { Dialog, Button, Flex, Stack, Box, Card, Text, Heading, useToast } from '@sanity/ui'
import { SanityDocument } from 'sanity'
import { useState } from 'react'
import { FilePdf, CheckCircle } from 'phosphor-react'

import { isWebKit, getFilename } from '../utils/browser'
import { getStateTranslationKey, canChangeToFullfillmentStatus } from '../utils/orders'

import OrderItemPreview from './OrderItemPreview'
import OrderFreeProductPreview from './OrderFreeProductPreview'
import OrderVoucherPreview from './OrderVoucherPreview'
import { OrderActions } from './actions/OrderActions'

type OrderViewProps = {
  document: {
    draft?: SanityDocument & Order
    published?: SanityDocument & Order
  }
}

export function OrderView({document}: OrderViewProps) {
  const { t, frontendClient, format } = useITSContext();

  // const {document} = props.published
  const order = document.published

  const [loadingPdf, setLoadingPdf] = useState(false)
  const [open, setOpen] = useState(false)
  const [fullfillmentStatus, setFullfillmentStatus] = useState<OrderStatus | undefined>(undefined)
  const [pdfUrl, setPdfUrl] = useState('')
  const toast = useToast()

  if (!order) {
    return (
      <Box padding={4}>
        <Text>{t('order.loading')}</Text>
      </Box>
    )
  }

  const handlePdfClick = async () => {
    setLoadingPdf(true)

    const result = await frontendClient.getOrderInvoicePdf(order!._id)
    if (result.error) {
      toast.push({
        status: "error",
        title: t('ui.errors.failedToLoad', {errorMessage: result.error})
      });
    } else {
      const blob = await result.data.blob()
      const url = URL.createObjectURL(blob)
      
      if (isWebKit()) {
        const link = window.document.createElement('a')
        link.href = url
        link.download = getFilename(result.data, `${order.invoiceNumber}.pdf`)
        link.click()
        link.remove()
      } else {
        const newTab = window.open(url, '_blank')
        if (!newTab) {
          setPdfUrl(url)
          setOpen(true)
        }
      }
      URL.revokeObjectURL(url)
    }
    setLoadingPdf(false)
  }

  const handleClose = () => {
    setOpen(false)
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl('')
    }
  }

  return (
    <Box padding={[2, 3]}>
      <Stack space={[2, 3]}>
        <Flex align="center" gap={3}>
          <Text weight='medium'>
            {`${format.date(order._createdAt, {dateStyle: 'short', timeStyle: 'short'})}`}
          </Text>
          <Button icon={FilePdf} loading={loadingPdf} mode="ghost" title={'PDF'} tone={'neutral'} onClick={handlePdfClick} />
          {open && pdfUrl && (
            <Dialog
              header="PDF Viewer"
              id="pdf-viewer-dialog"
              width={2}
              onClose={handleClose}
            >
              <Flex direction="column" padding={3}>
                <iframe
                  id="pdf-viewer-iframe"
                  src={pdfUrl}
                  title='PDF Viewer'
                />
              </Flex>
            </Dialog>
          )}
          {canChangeToFullfillmentStatus('processing', order) && (
            <Button icon={CheckCircle} text={t('order.status.options.processing')} mode="ghost" onClick={() => setFullfillmentStatus('processing')} />
          )}
          {canChangeToFullfillmentStatus('shipped', order) && (
            <Button icon={CheckCircle} text={t('order.status.options.shipped')} mode="ghost" onClick={() => setFullfillmentStatus('shipped')} />
          )}
          {fullfillmentStatus !== undefined && (
            <OrderActions
              order={order}
              onComplete={() => setFullfillmentStatus(undefined)}
              selectedFullfillmentStatus={fullfillmentStatus}
            />
          )}
        </Flex>
        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.status.title')}
          </Text>
          <Text weight='medium'>
            {t(getStateTranslationKey(order.status))}
          </Text>
        </Flex>
        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.paymentStatus.title')}
          </Text>
          <Text weight='medium'>
            {t(getStateTranslationKey(order.paymentStatus))}
          </Text>
        </Flex>
        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.orderNumber')}
          </Text>
          <Text weight='medium'>
            {order.orderNumber}
          </Text>
        </Flex>
        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.invoiceNumber')}
          </Text>
          <Text weight='medium'>
            {order.invoiceNumber}
          </Text>
        </Flex>
        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.subtotal')}
          </Text>
          <Text weight='medium'>
            {`${format.currency(order.totals.subtotal / 100)}`}
          </Text>
        </Flex>
        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.shipping')}
          </Text>
          <Text weight='medium'>
            {`${format.currency(order.shipping.rateCost / 100)}`}
          </Text>
        </Flex>
        {(order.totals.discount && order.totals.discount > 0) ? <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.discount')}
          </Text>
          <Text weight='medium'>
            {`${format.currency(-(order.totals.discount / 100))}`}
          </Text>
        </Flex> : null}
        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.total')}
            {/* {t('order.totalWithVat', {vatRate: order.totals.vatRate, total: localizeMoney(order.totals.vat / 100, locale)})} */}
          </Text>
          <Text weight='medium'>
            {`${format.currency(order.totals.total / 100)}`}
          </Text>
        </Flex>
        <Stack marginTop={4} space={2}>
          <Box padding={2}>
            <Heading as="h3">
              {t('order.shipping')}
            </Heading>
          </Box>
          <Card
            radius={2}
            shadow={1}
            tone="primary"
          >
            <Flex gap={3} direction="column" padding={2} marginTop={1}>
              <Text>{order.shipping.address.lastname} {order.shipping.address.prename}</Text>
              <Text>{order.shipping.address.line1} {order.shipping.address.line2 || ''}</Text>
              <Text>{order.shipping.address.zip} {order.shipping.address.city}, {order.shipping.address.country} {order.shipping.address.state || ''}</Text>
              <Text>{order.contactEmail}</Text>
              <Text>{order.shipping.rateTitle}</Text>
              {order.trackingNumber && <Text>{t('order.trackingNumber')} {order.trackingNumber}</Text>}
            </Flex>
          </Card>
        </Stack>
        {order.billingAddress && (
          <Stack marginTop={4} space={2}>
            <Box padding={2}>
              <Heading as="h3">
                {t('order.billingAddress')}
              </Heading>
            </Box>
            <Card
              radius={2}
              shadow={1}
              tone="primary"
            >
              <Flex gap={3} direction="column" padding={2} marginTop={1}>
                <Text>{order.billingAddress.lastname} {order.billingAddress.prename}</Text>
                <Text>{order.billingAddress.line1} {order.billingAddress.line2 || ''}</Text>
                <Text>{order.billingAddress.zip} {order.billingAddress.city}, {order.billingAddress.country} {order.billingAddress.state || ''}</Text>
              </Flex>
            </Card>
          </Stack>
        )}
        <Stack marginTop={4} space={2}>
          <Box padding={2}>
            <Heading as="h3">
              {t('order.items')}
            </Heading>
          </Box>
          {(order.items || []).map((item, index) => (
              <OrderItemPreview key={index} item={item} orderId={order._id}/>
          ))}
        </Stack>
        {order.freeProducts && order.freeProducts.length > 0 && <Stack marginTop={4} space={2}>
          <Box padding={2}>
            <Heading as="h3">
              {t('order.freeProducts')}
            </Heading>
          </Box>
          {order.freeProducts.map((item, index) => (
              <OrderFreeProductPreview key={index} item={item} orderId={order._id}/>
          ))}
        </Stack>}
        {order.vouchers && order.vouchers.length > 0 && <Stack marginTop={4} space={2}>
          <Box padding={2}>
            <Heading as="h3">
              {t('order.vouchers')}
            </Heading>
          </Box>
          {order.vouchers.map((item, index) => (
              <OrderVoucherPreview key={index} {...item}/>
          ))}
        </Stack>}
        <Stack marginTop={4} space={2}>
          <Box padding={2}>
            <Heading as="h3">
              {t('order.statusHistory.name')}
            </Heading>
          </Box>
          {(order.statusHistory || []).toReversed().map((item, index) => (
            <Card
              key={index}
              radius={2}
              shadow={1}
              tone="primary"
            >
              <Flex gap={3} direction="column" padding={2} marginTop={1}>
                <Text weight='medium'>{`${format.date(item.timestamp, {dateStyle: 'medium', timeStyle: 'medium'})}`}</Text>
                <Text>{`${t(`order.statusHistory.type.options.${item.type}`)} - ${t(getStateTranslationKey(item.state))}`}</Text>
                <Text>{[item.source || '', item.note || ''].filter(Boolean).join(' - ')}</Text>
              </Flex>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}