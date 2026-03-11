import React from 'react'
import { styled } from 'styled-components'

import {
  ArrowUDownLeftIcon,
  CheckIcon,
  CircleIcon,
  ClockIcon,
  ErrorOutlineIcon,
  QuestionIcon,
  TruckIcon,
  WarningIcon,
} from '../assets/icons'
import { Order } from '../types'

export type OrderStatus = Order['status']
export type OrderPaymentStatus = Order['paymentStatus']

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
}): React.ReactElement => {
  const { color, icon: Icon } = getOrderGeneralState(status, paymentStatus)
  return (
    <StyledSpan $color={color}>
      <Icon />
    </StyledSpan>
  )
}
