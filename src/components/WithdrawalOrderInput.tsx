/**
 * Order field of an `orderWithdrawal` (`orderRef`).
 *
 * - Read-only unless the **published** record is `unmatched` (a web declaration that
 *   matched no order) — normal withdrawals stay protected.
 * - While unmatched: suggests orders matching the submitted order number, email or
 *   name ("use this order"); otherwise the normal reference picker (its filter hides
 *   orders that already have an open withdrawal).
 * - `status` follows the field: an order set → `received`, cleared → `unmatched`.
 *   After publishing, "Resend confirmation" mails the normal receipt to the order's
 *   email.
 */
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import {
  type ObjectInputProps,
  set,
  useDocumentOperation,
  useEditState,
  useFormValue,
} from 'sanity'

import { useITSContext } from '../context/ITSCoreProvider'

type Suggestion = {
  _id: string
  orderNumber?: string
  createdAt: string
  name?: string
  email?: string
  total?: number
}

const SUGGESTIONS_QUERY = `*[_type == "order" && !(_id in path("drafts.**")) && (
    orderNumber == $orderNumber ||
    lower(customer.contactEmail) == $email ||
    lower(customer.billingAddress.name) == $name
  ) && !(_id in *[_type == "orderWithdrawal" && status in ["received", "processing"] && defined(orderRef._ref)].orderRef._ref)
] | order(_createdAt desc)[0...5]{
  _id,
  orderNumber,
  "createdAt": _createdAt,
  "name": customer.billingAddress.name,
  "email": customer.contactEmail,
  "total": totals.grandTotal
}`

export function WithdrawalOrderInput(props: ObjectInputProps): ReactElement {
  const { value, onChange, renderDefault } = props
  const { componentT, sanityClient } = useITSContext()
  const t = componentT.default

  const documentId = String(useFormValue(['_id']) ?? '').replace(/^drafts\./, '')
  const status = useFormValue(['status']) as string | undefined
  const submittedOrderNumber = useFormValue(['orderNumber']) as string | undefined
  const submittedEmail = useFormValue(['email']) as string | undefined
  const submittedName = useFormValue(['name']) as string | undefined

  const editState = useEditState(documentId, 'orderWithdrawal')
  const publishedStatus = (editState.published as { status?: string } | null)?.status
  const editable = publishedStatus === 'unmatched'
  const { patch } = useDocumentOperation(documentId, 'orderWithdrawal')

  const ref = (value as { _ref?: string } | undefined)?._ref

  // Status follows the field (only while the record is being assigned).
  useEffect(() => {
    if (!editable) return
    const next = ref ? 'received' : 'unmatched'
    if (status !== next) patch.execute([{ set: { status: next } }])
  }, [editable, ref, status, patch])

  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null)
  useEffect(() => {
    if (!editable || ref) return undefined
    let active = true
    sanityClient
      .fetch<Suggestion[]>(SUGGESTIONS_QUERY, {
        orderNumber: submittedOrderNumber?.trim() ?? '',
        email: submittedEmail?.trim().toLowerCase() ?? '',
        name: submittedName?.trim().toLowerCase() ?? '',
      })
      .then((result) => {
        if (active) setSuggestions(result)
      })
    return () => {
      active = false
    }
  }, [editable, ref, submittedOrderNumber, submittedEmail, submittedName, sanityClient])

  const assignOrder = useCallback(
    (orderId: string) => onChange(set({ _type: 'reference', _ref: orderId })),
    [onChange],
  )

  if (!editable) return renderDefault({ ...props, readOnly: true })

  return (
    <Stack gap={3}>
      {!ref && suggestions && (
        <Stack gap={2}>
          <Text size={1} weight="semibold">
            {suggestions.length
              ? t('actions.orderWithdrawal.assign.suggestions', 'Possible orders')
              : t(
                  'actions.orderWithdrawal.assign.noSuggestions',
                  'No order matches the submitted details — search below.',
                )}
          </Text>
          {suggestions.map((s) => (
            <SuggestionCard key={s._id} suggestion={s} onUse={assignOrder} />
          ))}
        </Stack>
      )}
      {renderDefault(props)}
    </Stack>
  )
}

function SuggestionCard({
  suggestion: s,
  onUse,
}: {
  suggestion: Suggestion
  onUse: (orderId: string) => void
}): ReactElement {
  const { componentT, format } = useITSContext()
  const t = componentT.default
  const handleClick = useCallback(() => onUse(s._id), [onUse, s._id])
  return (
    <Card padding={3} radius={2} border>
      <Flex align="center" gap={3}>
        <Box flex={1}>
          <Stack gap={2}>
            <Text size={1} weight="semibold">
              #{s.orderNumber} · {s.name}
            </Text>
            <Text size={1} muted>
              {[
                s.email,
                format.date(s.createdAt, { dateStyle: 'medium' }),
                typeof s.total === 'number' ? format.currency(s.total / 100) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </Stack>
        </Box>
        <Button
          mode="ghost"
          text={t('actions.orderWithdrawal.assign.useOrder', 'Use this order')}
          onClick={handleClick}
        />
      </Flex>
    </Card>
  )
}
