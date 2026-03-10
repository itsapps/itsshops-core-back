import { studioTheme, ThemeProvider } from '@sanity/ui'
// import React from 'react'
import { LayoutProps } from 'sanity'

import { ITSCoreProvider } from '../context/ITSCoreProvider'
import { ITSContext } from '../types'

export const ITSStudioWrapper = (ctx: ITSContext) => {
  // We return a function that Sanity expects for the 'layout' component
  const Wrapper = (props: LayoutProps) => (
    <ThemeProvider theme={studioTheme}>
      <ITSCoreProvider ctx={ctx}>{props.renderDefault(props)}</ITSCoreProvider>
    </ThemeProvider>
  )
  Wrapper.displayName = 'ITSStudioWrapper'
  return Wrapper
}
