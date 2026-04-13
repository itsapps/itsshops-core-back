import { Badge, Box, Card, Flex, Heading, Stack, Text } from '@sanity/ui'
import { useCallback } from 'react'
import { type SanityDocument } from 'sanity'
import { type UserViewComponent } from 'sanity/structure'

import {
  getStateTranslationKey,
  type OrderPaymentStatus,
  type OrderStatus,
} from '../utils/orderTransitions'
import { useITSContext } from '../context/ITSCoreProvider'
import { TranslatorFunction } from '../types/localization'

// ── Document shape ──────────────────────────────────────────────────────────
// Mirrors the actual core-back schemas (see schemas/documents/orders/order.ts
// and schemas/objects/orders/*). Kept inline to avoid coupling the view to a
// type that lives in another package.

type Address = {
  name?: string
  prename?: string
  lastname?: string
  phone?: string
  line1: string
  line2?: string
  zip: string
  city: string
  country: string
  state?: string
}

type OrderItemOption = {
  _key?: string
  groupTitle: string
  optionTitle: string
}

type OrderItem = {
  _key: string
  kind: 'wine' | 'physical' | 'digital' | 'bundle'
  variantId: string
  productId: string
  parentId?: string
  title: string
  subtitle?: string
  sku?: string
  quantity: number
  price: number
  vatRate: number
  vatAmount: number
  weight?: number
  packed?: boolean
  options?: OrderItemOption[]
  wine?: { vintage?: string; volume?: number }
  bundle?: { itemCount: number }
}

type VatBreakdownItem = {
  _key: string
  rate: number
  net: number
  vat: number
}

type OrderTotals = {
  grandTotal: number
  subtotal: number
  shipping: number
  discount: number
  totalVat: number
  vatBreakdown?: VatBreakdownItem[]
  currency: string
}

type PackagingLine = {
  _key: string
  volume: number
  packSize: number
  quantity: number
  price: number
}

type Fulfillment = {
  methodTitle?: string
  methodType: 'delivery' | 'pickup'
  shippingCost: number
  trackingCode?: string
  pickupLocation?: string
  taxSnapshot?: VatBreakdownItem
  packagingLines?: PackagingLine[]
}

type StatusHistoryEntry = {
  _key: string
  type: 'payment' | 'fulfillment'
  status: OrderStatus | OrderPaymentStatus
  timestamp: string
  source?: string
  note?: string
}

interface OrderDocument extends SanityDocument {
  orderNumber?: string
  invoiceNumber?: string
  status: 'created' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'returned'
  paymentStatus: 'succeeded' | 'refunded' | 'partiallyRefunded'
  paymentIntentId: string
  orderItems: OrderItem[]
  customer: {
    locale: string
    contactEmail: string
    billingAddress?: Address
    shippingAddress: Address
  }
  totals: OrderTotals
  fulfillment: Fulfillment
  statusHistory?: StatusHistoryEntry[]
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_TONES: Record<string, 'positive' | 'caution' | 'critical' | 'primary' | 'default'> = {
  created: 'primary',
  processing: 'caution',
  shipped: 'caution',
  delivered: 'positive',
  canceled: 'critical',
  returned: 'critical',
  succeeded: 'positive',
  refunded: 'critical',
  partiallyRefunded: 'caution',
}

function formatAddressLines(address: Address): string[] {
  const fullName = [address.prename, address.lastname].filter(Boolean).join(' ') || address.name
  const cityLine = [address.country, address.zip, address.city].filter(Boolean).join(' ')
  const countryLine = [address.state].filter(Boolean).join(' · ')
  return [
    fullName ?? '',
    address.line1,
    address.line2,
    cityLine,
    countryLine,
    address.phone,
  ].filter((s): s is string => Boolean(s && s.trim()))
}

// ── View ────────────────────────────────────────────────────────────────────

export const OrderView: UserViewComponent = (props) => {
  const { format, componentT, schemaT } = useITSContext()
  const t = componentT.default
  const tStatus = (status: string) => componentT.default(`order.status.options.${status}`, status)
  const tPaymentStatus = (status: string) =>
    componentT.default(`order.paymentStatus.options.${status}`, status)
  const tHistoryType = (type: string) =>
    componentT.default(`order.statusHistory.type.options.${type}`, type)

  const order = (props.document.displayed ?? props.document.published) as OrderDocument | undefined
  const currency = order?.totals?.currency ?? 'EUR'

  const money = useCallback(
    (cents: number | undefined): string =>
      typeof cents === 'number' ? format.currency(cents / 100, currency) : '—',
    [format, currency],
  )

  if (!order) {
    return (
      <Box padding={4}>
        <Text>{t('order.loading')}</Text>
      </Box>
    )
  }

  const { customer, totals, fulfillment } = order
  const shippingAddress = customer?.shippingAddress
  const billingAddress = customer?.billingAddress

  return (
    <Box padding={[3, 4]}>
      <Stack space={4}>
        {/* ── Header: order/invoice number, statuses ──────────────────── */}
        <Flex align="flex-start" justify="space-between" wrap="wrap" gap={3}>
          <Stack space={2}>
            <Heading as="h2" size={2}>
              {order.orderNumber
                ? `${t('order.orderNumber')} ${order.orderNumber}`
                : t('order.loading')}
            </Heading>
            {order.invoiceNumber && (
              <Text muted>
                {t('order.invoiceNumber')} {order.invoiceNumber}
              </Text>
            )}
            <Text muted>
              {format.date(order._createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
            </Text>
          </Stack>
          <Flex gap={2} wrap="wrap">
            <Badge tone={STATUS_TONES[order.status] ?? 'default'}>{tStatus(order.status)}</Badge>
            <Badge tone={STATUS_TONES[order.paymentStatus] ?? 'default'}>
              {tPaymentStatus(order.paymentStatus)}
            </Badge>
          </Flex>
        </Flex>

        {/* ── Totals ──────────────────────────────────────────────────── */}
        <Card padding={3} radius={2} shadow={1} tone="primary">
          <Stack space={3}>
            <TotalRow label={t('order.subtotal')} value={money(totals?.subtotal)} />
            <TotalRow label={t('order.shipping')} value={money(totals?.shipping)} />
            {totals?.discount > 0 && (
              <TotalRow label={t('order.discount')} value={`− ${money(totals.discount)}`} />
            )}
            {totals?.vatBreakdown?.map((vb) => (
              <TotalRow
                key={vb._key}
                label={t('order.vatRate', `${vb.rate}% Vat`, { vatRate: vb.rate })}
                value={money(vb.vat)}
                muted
              />
            ))}
            <TotalRow label={t('order.total')} value={money(totals?.grandTotal)} bold />
          </Stack>
        </Card>

        {/* ── Customer + addresses ────────────────────────────────────── */}
        <Flex gap={3} wrap="wrap">
          {shippingAddress && (
            <AddressCard
              title={t('order.shipping')}
              lines={[
                customer.contactEmail,
                ...formatAddressLines(shippingAddress),
                fulfillment?.methodTitle,
                fulfillment?.trackingCode
                  ? `${t('order.trackingNumber')} ${fulfillment.trackingCode}`
                  : null,
                fulfillment?.pickupLocation,
              ].filter((l): l is string => Boolean(l))}
            />
          )}
          {billingAddress && (
            <AddressCard
              title={t('order.billingAddress')}
              lines={formatAddressLines(billingAddress)}
            />
          )}
        </Flex>

        {/* ── Packaging lines ─────────────────────────────────────────── */}
        {fulfillment?.packagingLines && fulfillment.packagingLines.length > 0 && (
          <Card padding={3} radius={2} shadow={1} tone="transparent">
            <Stack space={3}>
              <Heading as="h4" size={1}>
                {t('order.packaging')}
              </Heading>
              <Stack space={2}>
                {fulfillment.packagingLines.map((line) => (
                  <Flex key={line._key} justify="space-between" gap={3}>
                    <Text>
                      {`${line.quantity}× ${line.packSize}-pack · ${line.volume >= 1000 ? `${line.volume / 1000} l` : `${line.volume} ml`}`}
                    </Text>
                    <Text weight="medium">{money(line.price * line.quantity)}</Text>
                  </Flex>
                ))}
              </Stack>
            </Stack>
          </Card>
        )}

        {/* ── Items ───────────────────────────────────────────────────── */}
        <Stack space={2}>
          <Heading as="h3" size={1}>
            {t('order.items')}
          </Heading>
          <Stack space={2}>
            {(order.orderItems ?? []).map((item) => (
              <OrderItemRow key={item._key} item={item} money={money} t={t} />
            ))}
          </Stack>
        </Stack>

        {/* ── Status history ──────────────────────────────────────────── */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <Stack space={2}>
            <Heading as="h3" size={1}>
              {t('order.statusHistory.name')}
            </Heading>
            <Stack space={2}>
              {[...order.statusHistory]
                .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                .map((entry) => (
                  <Card key={entry._key} padding={3} radius={2} shadow={1} tone="transparent">
                    <Stack space={2}>
                      <Flex justify="space-between" gap={2} wrap="wrap">
                        <Text weight="medium">
                          {`${tHistoryType(entry.type)} - ${schemaT.default(getStateTranslationKey(entry.status), entry.status)}`}
                        </Text>
                        <Text muted>
                          {format.date(entry.timestamp, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </Text>
                      </Flex>
                      {(entry.source || entry.note) && (
                        <Text muted>{[entry.source, entry.note].filter(Boolean).join(' — ')}</Text>
                      )}
                    </Stack>
                  </Card>
                ))}
            </Stack>
          </Stack>
        )}

        {/* <Text muted size={0} style={{ fontFamily: 'monospace' }}>
          paymentIntent: {order.paymentIntentId}
        </Text> */}
      </Stack>
    </Box>
  )
}

// ── Subcomponents ──────────────────────────────────────────────────────────

function TotalRow({
  label,
  value,
  bold,
  muted,
}: {
  label: string
  value: string
  bold?: boolean
  muted?: boolean
}) {
  return (
    <Flex justify="space-between" gap={3}>
      <Text muted={muted} weight={bold ? 'semibold' : undefined}>
        {label}
      </Text>
      <Text muted={muted} weight={bold ? 'semibold' : 'medium'}>
        {value}
      </Text>
    </Flex>
  )
}

function AddressCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <Card padding={3} radius={2} shadow={1} tone="transparent" style={{ flex: '1 1 280px' }}>
      <Stack space={3}>
        <Heading as="h4" size={1}>
          {title}
        </Heading>
        <Stack space={2}>
          {lines.map((line) => (
            <Text key={line}>{line}</Text>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}

function OrderItemRow({
  item,
  money,
  t,
}: {
  item: OrderItem
  money: (cents: number | undefined) => string
  t: TranslatorFunction
}) {
  const lineTotal = item.price * item.quantity

  return (
    <Card padding={3} radius={2} shadow={1} tone="transparent">
      <Flex gap={3} align="flex-start" justify="space-between">
        <Stack space={2} flex={1}>
          <Flex gap={2} align="center" wrap="wrap">
            <Text weight="semibold">
              {item.quantity}× {item.title}
            </Text>
          </Flex>
          {item.subtitle && (
            <Text muted>{item.subtitle}</Text>
          )}
          <Flex gap={3} wrap="wrap">
            {item.sku && (
              <Text muted style={{ fontFamily: 'monospace' }}>
                SKU {item.sku}
              </Text>
            )}
            {/* {typeof item.weight === 'number' && (
              <Text size={0} muted>
                {item.weight} g
              </Text>
            )} */}
            <Text muted>
              {`${t('order.vatRate', `${item.vatRate}% Vat`, { vatRate: item.vatRate })} (${money(item.vatAmount)})`}
            </Text>
          </Flex>
        </Stack>
        <Stack space={2} style={{ textAlign: 'right' }}>
          <Text weight="semibold">{money(lineTotal)}</Text>
          <Text muted>
            {money(item.price)} × {item.quantity}
          </Text>
        </Stack>
      </Flex>
    </Card>
  )
}

