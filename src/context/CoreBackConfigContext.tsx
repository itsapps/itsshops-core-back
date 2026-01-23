// studio/context/CoreBackConfigContext.tsx
import React, { createContext, useContext } from 'react'
import { CoreBackConfig } from '../types/config'

const CoreBackConfigContext = createContext<CoreBackConfig | null>(null)

export const CoreBackConfigProvider = ({
  config,
  children,
}: {
  config: CoreBackConfig
  children: React.ReactNode
}) => {
  return (
    <CoreBackConfigContext.Provider value={config}>
      {children}
    </CoreBackConfigContext.Provider>
  )
}

export const useCoreBackConfig = () => {
  const context = useContext(CoreBackConfigContext)
  if (!context) throw new Error('CoreBackConfigContext is not provided')
  return context
}
