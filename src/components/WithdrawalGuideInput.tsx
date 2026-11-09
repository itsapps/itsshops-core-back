/**
 * Document-level input of `orderWithdrawal`: a guide box above the form — the next step
 * (`withdrawalNextStep`), the refund deadline with the legal hint for open withdrawals, and a
 * collapsible "How it works" for the whole flow. Then the normal form (`renderDefault`).
 *
 * Reads the linked order live (fetch + listen), so the step follows refunds / status changes
 * made elsewhere (order dialog, Stripe dashboard via the webhook).
 */
import { Box, Card, Flex, Stack, Text } from '@sanity/ui'
import { useEffect, useState } from 'react'
import type { ObjectInputProps } from 'sanity'
import { styled } from 'styled-components'

import { ChevronRightIcon } from '../assets/icons'
import { useITSContext } from '../context/ITSCoreProvider'
import { withdrawalNextStep, type WithdrawalOrderLike } from '../utils/withdrawals'

type GuideOrder = WithdrawalOrderLike & { _id: string }

const ORDER_QUERY = `*[_id == $id][0]{ _id, status, paymentStatus, "grandTotal": totals.grandTotal, "refunds": refunds[]{ amount, status, createdAt } }`

/** The linked order, live. `undefined` while loading, `null` when there is none. */
function useLinkedOrder(orderId: string | undefined): GuideOrder | null | undefined {
  const { sanityClient } = useITSContext()
  // Keyed by the order id, so a changed `orderRef` reads as loading until its fetch lands.
  const [loaded, setLoaded] = useState<{ id: string; order: GuideOrder | null } | null>(null)

  useEffect(() => {
    if (!orderId) return undefined
    let active = true
    const load = () => {
      sanityClient.fetch<GuideOrder | null>(ORDER_QUERY, { id: orderId }).then((order) => {
        if (active) setLoaded({ id: orderId, order })
      })
    }
    load()
    const sub = sanityClient
      .listen(`*[_id == $id]`, { id: orderId }, { visibility: 'query' })
      .subscribe(() => load())
    return () => {
      active = false
      sub.unsubscribe()
    }
  }, [orderId, sanityClient])

  if (!orderId) return null
  return loaded?.id === orderId ? loaded.order : undefined
}

/** One option of the unmatched step: bold case, then what to do. */
function AssignOption({ lead, text }: { lead: string; text: string }) {
  return (
    <Flex as="li" gap={2} style={{ listStyle: 'none' }}>
      <Text size={1} aria-hidden="true">
        •
      </Text>
      <Box flex={1}>
        <Text size={1}>
          <strong>{lead}</strong> {text}
        </Text>
      </Box>
    </Flex>
  )
}

/**
 * Native `<details>` (keyboard + screen reader for free; the browser's focus outline is kept) with
 * the default marker replaced by a chevron that turns when open.
 */
const HowTo = styled.details`
  & > summary {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    list-style: none;
    border-radius: 3px;
  }
  & > summary::-webkit-details-marker {
    display: none;
  }
  & > summary .chevron {
    font-size: 1.25rem;
    transition: transform 150ms ease;
  }
  &[open] > summary .chevron {
    transform: rotate(90deg);
  }
  @media (prefers-reduced-motion: reduce) {
    & > summary .chevron {
      transition: none;
    }
  }
`

const HOW_TO_STEPS = ['assign', 'notShipped', 'shipped', 'partial', 'reject', 'deadline'] as const

export function WithdrawalGuideInput(props: ObjectInputProps) {
  const { componentT, format } = useITSContext()
  const t = componentT.default

  const withdrawal = (props.value ?? {}) as {
    status?: string
    declaredAt?: string
    orderRef?: { _ref?: string }
  }
  const orderId = withdrawal.orderRef?._ref
  const order = useLinkedOrder(orderId)

  const date = (d: Date | string) => format.date(d, { dateStyle: 'long' })
  const money = (cents: number) => format.currency(cents / 100)

  // Wait for the order before naming a step that depends on it.
  const loading = !!orderId && order === undefined
  const next = loading ? undefined : withdrawalNextStep(withdrawal, order)

  let stepText = ''
  if (next) {
    const k = 'actions.orderWithdrawal.guide.step'
    switch (next.step) {
      case 'assign':
        // Rendered as two options below (`AssignOptions`).
        stepText = t(`${k}.assignIntro`, 'Unmatched — the details match no order:')
        break
      case 'close':
        stepText = t(
          `${k}.close`,
          'The order is already refunded → “Refund & close” closes the withdrawal.',
        )
        break
      case 'refund':
        stepText =
          next.why === 'notShipped'
            ? t(
                `${k}.refundNotShipped`,
                'Not shipped yet → “Refund & close” (also cancels the order).',
              )
            : t(`${k}.refundNothingToWait`, 'Nothing more to wait for → “Refund & close”.')
        break
      case 'partial':
        stepText = t(
          `${k}.partial`,
          '{{amount}} already refunded (e.g. in the order’s status dialog or the Stripe dashboard) → “Refund & close”: refund the rest or close only.',
          { amount: money(next.refundedCents ?? 0) },
        )
        break
      case 'wait':
        stepText = t(
          `${k}.wait`,
          'Wait for the goods (set “Processing”). Once they are back or the customer proves dispatch → “Refund & close” (full or partial).',
        )
        break
      case 'done':
        stepText =
          next.refundedCents && next.lastRefundAt
            ? t(`${k}.done`, 'Refunded {{amount}}, last on {{date}}.', {
                amount: money(next.refundedCents),
                date: date(next.lastRefundAt),
              })
            : t(`${k}.doneNoAmount`, 'Refunded.')
        break
      case 'rejected':
        stepText = t(`${k}.rejected`, 'Closed as rejected (see the internal note).')
        break
      default:
        stepText = t(`${k}.noOrder`, 'The linked order was not found.')
    }
  }

  const deadline = next?.deadline
  // An unmatched one always needs an action: at least `caution`.
  const deadlineTone = deadline?.tone ?? 'default'
  const tone = next?.step === 'assign' && deadlineTone === 'default' ? 'caution' : deadlineTone

  return (
    <Stack gap={5}>
      <Card padding={4} radius={2} border tone={tone}>
        <Stack gap={4}>
          <Text size={1} weight="semibold">
            {t('actions.orderWithdrawal.guide.title', 'Next step')}
          </Text>
          <Text size={1}>{loading ? t('ui.loading', 'Loading…') : stepText}</Text>
          {next?.step === 'assign' && (
            <Stack as="ul" role="list" gap={3} style={{ margin: 0, paddingInlineStart: 0 }}>
              <AssignOption
                lead={t(
                  'actions.orderWithdrawal.guide.step.assignOrderLead',
                  'Belongs to an order',
                )}
                text={t(
                  'actions.orderWithdrawal.guide.step.assignOrder',
                  '(e.g. a typo): “Assign order”. The refund period is already running (see below).',
                )}
              />
              <AssignOption
                lead={t(
                  'actions.orderWithdrawal.guide.step.assignDeleteLead',
                  'Belongs to no order',
                )}
                text={t(
                  'actions.orderWithdrawal.guide.step.assignDelete',
                  '(e.g. spam): delete it — by {{date}} at the latest, because a stranger’s data may be kept for 30 days at most.',
                  { date: next.assignBy ? date(next.assignBy) : '' },
                )}
              />
            </Stack>
          )}

          {deadline && (
            <Stack gap={3}>
              {deadline.overdueSince && (
                <Text size={1} weight="semibold">
                  {t('actions.orderWithdrawal.guide.overdue', 'Overdue since {{date}}', {
                    date: date(deadline.overdueSince),
                  })}
                </Text>
              )}
              <Text size={1}>
                {t(
                  'actions.orderWithdrawal.guide.deadline',
                  'Refund by {{date}} (14 days from receiving the withdrawal). Holding it back is allowed until the goods are back or the customer proves dispatch.',
                  { date: date(deadline.dueDate) },
                )}
              </Text>
            </Stack>
          )}

          <HowTo>
            <summary>
              <ChevronRightIcon aria-hidden="true" className="chevron" />
              <Text as="span" size={1} weight="medium">
                {t('actions.orderWithdrawal.guide.howTo.summary', 'How it works')}
              </Text>
            </summary>
            <Stack
              as="ol"
              role="list"
              gap={3}
              paddingTop={3}
              style={{ margin: 0, paddingInlineStart: 0 }}
            >
              {HOW_TO_STEPS.map((s, i) => (
                <Flex as="li" key={s} gap={2} style={{ listStyle: 'none' }}>
                  <Box style={{ minWidth: '1.25rem' }}>
                    <Text size={1} weight="medium" aria-hidden="true">
                      {i + 1}.
                    </Text>
                  </Box>
                  <Box flex={1}>
                    <Text size={1}>{t(`actions.orderWithdrawal.guide.howTo.${s}`, s)}</Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </HowTo>
        </Stack>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  )
}
