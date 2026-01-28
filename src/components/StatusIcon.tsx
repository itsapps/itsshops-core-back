import {OrderStatus, OrderPaymentStatus} from '../types'

import {ErrorOutlineIcon} from '@sanity/icons'
import { styled } from 'styled-components'
import {ArrowUDownLeft, Circle, Warning, Clock, Truck, Check, Question} from 'phosphor-react'

const StyledSpan = styled.span<{ $color: string }>`
  > svg {
    color: ${props => (props.$color)};
  }
`

export const getOrderGeneralState = (
  status: OrderStatus,
  payment: OrderPaymentStatus
): { state: string; color: string; icon: React.FC } => {
  if (payment === 'refunded') return { state: 'refunded', color: 'red', icon: ArrowUDownLeft }
  if (payment === 'partiallyRefunded') return { state: 'attention', color: 'yellow', icon: Warning }

  switch (status) {
    case 'created':
      return { state: 'new', color: 'gray', icon: Circle }
    case 'processing':
      return { state: 'processing', color: 'yellow', icon: Clock }
    case 'shipped':
      return { state: 'shipped', color: 'blue', icon: Truck }
    case 'delivered':
      return { state: 'completed', color: 'green', icon: Check }
    case 'returned':
      return { state: 'returned', color: 'orange', icon: ArrowUDownLeft }
    case 'canceled':
      return { state: 'canceled', color: 'red', icon: ErrorOutlineIcon }
    default:
      return { state: 'unknown', color: 'gray', icon: Question }
  }
}

export const StatusIcon = ({ status, paymentStatus }: {status: OrderStatus, paymentStatus: OrderPaymentStatus}) => {
  const { color, icon: Icon } = getOrderGeneralState(status, paymentStatus)
  return (
    <StyledSpan $color={color}>
      <Icon />
    </StyledSpan>
  )
}