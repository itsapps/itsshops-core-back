import { ITSLocaleContext, ITSProviderContext } from '../types'
import { createContext, useContext, useMemo } from 'react'
import { useTranslation } from 'sanity'
import { createFrontendClient } from '../external/frontend'

// import { useCurrentLocale } from './your-locale-hook' // Replace with your actual hook


const ITSCoreContext = createContext<ITSProviderContext | null>(null)

export const ITSCoreProvider = ({ children, ctx }: { children: React.ReactNode, ctx: ITSLocaleContext }) => {
  const { t } = useTranslation('itsapps')
  
  const frontendClient = useMemo(() => {
    const { endpoint, secret } = ctx.config.integrations.netlify;
    return createFrontendClient(ctx.locale, endpoint, secret);
  }, [ctx.locale, ctx.config.integrations.netlify]);

  const value = useMemo(() => ({
    ...ctx,
    t,
    frontendClient
  }), [ctx, t, frontendClient]);

  return <ITSCoreContext.Provider value={value}>{children}</ITSCoreContext.Provider>
}

// 2. Create the "God Hook"
export const useITSContext = () => {
  const context = useContext(ITSCoreContext)
  if (!context) throw new Error("useEngine must be used within ITSCoreProvider")
  return context
}