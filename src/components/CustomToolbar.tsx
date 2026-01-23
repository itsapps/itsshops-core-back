import React from 'react'
import { ToolMenuProps } from 'sanity'
import { DeployDialog } from './DeployDialog'

export function CustomToolbar(props: ToolMenuProps) {
  
  return (
    <>
      {props.renderDefault(props)}
      <DeployDialog/>
    </>
  )
}