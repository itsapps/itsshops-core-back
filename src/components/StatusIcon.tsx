import {OrderStatus, OrderPaymentStatus} from '../types'
import React from 'react'
import {ErrorOutlineIcon} from '@sanity/icons'
import { styled } from 'styled-components'
import {ArrowUDownLeftIcon, CircleIcon, WarningIcon, ClockIcon, TruckIcon, CheckIcon, QuestionIcon} from '@phosphor-icons/react'

const StyledSpan = styled.span<{ $color: string }>`
  > svg {
    color: ${(props) => props.$color};
  }
`

export const getOrderGeneralState = (
  status: OrderStatus,
  payment: OrderPaymentStatus,
): { state: string; color: string; icon: React.FC } => {
  if (payment === 'refunded') return { state: 'refunded', color: 'red', icon: ArrowUDownLeftIcon }
  if (payment === 'partiallyRefunded')
    return { state: 'attention', color: 'yellow', icon: WarningIcon }

  switch (status) {
    case 'created':
      return { state: 'new', color: 'gray', icon: CircleIcon }
    case 'processing':
      return { state: 'processing', color: 'yellow', icon: ClockIcon }
    case 'shipped':
      return { state: 'shipped', color: 'blue', icon: TruckIcon }
    case 'delivered':
      return { state: 'completed', color: 'green', icon: CheckIcon }
    case 'returned':
      return { state: 'returned', color: 'orange', icon: ArrowUDownLeftIcon }
    case 'canceled':
      return { state: 'canceled', color: 'red', icon: ErrorOutlineIcon }
    default:
      return { state: 'unknown', color: 'gray', icon: QuestionIcon }
  }
}

export const StatusIcon = ({
  status,
  paymentStatus,
}: {
  status: OrderStatus
  paymentStatus: OrderPaymentStatus
}) => {
  const { color, icon: Icon } = getOrderGeneralState(status, paymentStatus)
  return (
    <StyledSpan $color={color}>
      <Icon />
    </StyledSpan>
  )
}