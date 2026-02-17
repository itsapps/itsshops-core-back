
import { useITSContext } from '../context/ITSCoreProvider'
import { OrderDataError } from './OrderDataError';

import React from 'react';
import { type UserViewComponent } from 'sanity/structure';
import { Heading, Box, Card, Stack, Text, Flex, Badge, Inline } from '@sanity/ui';
import { strictOrderSchema, getStateTranslationKey } from '../utils/orders1';

export const OrderView: UserViewComponent = ({ document }) => {
  const { published } = document;
  const ctx = useITSContext();
  const { frontendClient, format } = ctx;
  const t = ctx.schemaT.default

  if (!published) return <Text>Initializing...</Text>

  const result = strictOrderSchema.safeParse(published)

  if (!result.success) {
    return <OrderDataError error={result.error} isDev={ctx.config.isDev} />
  }

  const order = result.data;

  return (
    <Box padding={[2, 3]}>
      <Stack space={[2, 3]}>
        <Flex align="center" gap={3}>
          <Text weight='medium'>
            {`${format.date(order._createdAt, {dateStyle: 'short', timeStyle: 'short'})}`}
          </Text>
          {/* <Button icon={FilePdf} loading={loadingPdf} mode="ghost" title={'PDF'} tone={'neutral'} onClick={handlePdfClick} />
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
          )} */}
        </Flex>

        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.fields.status.title')}
          </Text>
          <Text weight='medium'>
            {t(getStateTranslationKey(order.status))}
          </Text>
        </Flex>
        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.fields.paymentStatus.title')}
          </Text>
          <Text weight='medium'>
            {t(getStateTranslationKey(order.paymentStatus))}
          </Text>
        </Flex>
        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.fields.orderNumber')}
          </Text>
          <Text weight='medium'>
            {order.orderNumber}
          </Text>
        </Flex>
        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.fields.invoiceNumber')}
          </Text>
          <Text weight='medium'>
            {order.invoiceNumber}
          </Text>
        </Flex>
        <Flex justify="space-between" wrap={'wrap'} gap={3}>
          <Text>
            {t('order.fields.subtotal')}
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
                <Text>{`${schemaT.default(`orderStatusHistory.fields.type.options.${item.type}`)} - ${schemaT.default(getStateTranslationKey(item.status))}`}</Text>
                <Text>{[item.source || '', item.note || ''].filter(Boolean).join(' - ')}</Text>
              </Flex>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};