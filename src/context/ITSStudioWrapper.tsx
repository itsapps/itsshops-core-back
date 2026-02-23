import { ITSLocaleContext } from '../types'
// import React from 'react'
import { LayoutProps } from 'sanity'
import { ITSCoreProvider } from '../context/ITSCoreProvider'
import {Card, ThemeProvider, studioTheme} from '@sanity/ui'

export const ITSStudioWrapper = (ctx: ITSLocaleContext) => {
  // We return a function that Sanity expects for the 'layout' component
  return (props: LayoutProps) => (
    <ThemeProvider theme={studioTheme}>
      <ITSCoreProvider ctx={ctx}>
      {props.renderDefault(props)}
    </ITSCoreProvider>
    </ThemeProvider>
    
  )
}