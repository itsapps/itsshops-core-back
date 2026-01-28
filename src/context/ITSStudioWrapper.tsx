import { ITSLocaleContext } from '../types'
// import React from 'react'
import { LayoutProps } from 'sanity'
import { ITSCoreProvider } from '../context/ITSCoreProvider'

export const ITSStudioWrapper = (ctx: ITSLocaleContext) => {
  // We return a function that Sanity expects for the 'layout' component
  return (props: LayoutProps) => (
    <ITSCoreProvider ctx={ctx}>
      {props.renderDefault(props)}
    </ITSCoreProvider>
  )
}