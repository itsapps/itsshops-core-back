import React, { ReactNode } from 'react'
import styled from 'styled-components'

interface DetailsProps {
  title: string | ReactNode
  children: ReactNode
  defaultOpen?: boolean
}

const StyledDetails = styled.details`
  margin-bottom: 1rem;
  overflow: hidden;

  &[open] {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`

const StyledSummary = styled.summary`
  cursor: pointer;
  list-style: none;
  padding: 0.75rem 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;

  &::-webkit-details-marker {
    display: none;
  }

  &:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
    border-radius: 4px;
  }
`

const Arrow = styled.span`
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
  transition: transform 0.2s ease;

  details[open] & {
    transform: rotate(-135deg);
  }
`

const Content = styled.div`
  padding: 0.75rem 1rem;
  line-height: 1.5;
  color: #333;
`

export const Details: React.FC<DetailsProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  return (
    <StyledDetails open={defaultOpen}>
      <StyledSummary>
        {title}
        <Arrow />
      </StyledSummary>
      <Content>{children}</Content>
    </StyledDetails>
  )
}
