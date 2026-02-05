import { ITSLocaleContext, ITSProviderContext } from '../types'
import { createContext, useContext, useMemo } from 'react'
import { useTranslation } from 'sanity'
import { createFrontendClient } from '../external/frontend'
import { createVinofactClient } from '../external/vinofact'

// import { useCurrentLocale } from './your-locale-hook' // Replace with your actual hook


const ITSCoreContext = createContext<ITSProviderContext | null>(null)

export const ITSCoreProvider = ({ children, ctx }: { children: React.ReactNode, ctx: ITSLocaleContext }) => {
  const { t } = useTranslation('itsapps')
  
  const frontendClient = useMemo(() => {
    const { endpoint, secret } = ctx.config.integrations.netlify;
    return createFrontendClient(ctx.locale, endpoint, secret);
  }, [ctx.locale, ctx.config.integrations.netlify]);

  const vinofactClient = useMemo(() => {
    const vinofact = ctx.config.features.shop.vinofact
    if (!vinofact?.integration?.endpoint || !vinofact?.integration?.accessToken) return undefined;
    
    // This helper would handle the fetch logic and headers
    return createVinofactClient(ctx.locale, vinofact.integration.endpoint, vinofact.integration.accessToken, vinofact.integration.profileSlug);
  }, [ctx.config.features.shop.vinofact, ctx.locale]);

  const value = useMemo(() => ({
    ...ctx,
    t,
    frontendClient,
    vinofactClient,
  }), [ctx, t, frontendClient, vinofactClient]);

  return <ITSCoreContext.Provider value={value}>{children}</ITSCoreContext.Provider>
}

// 2. Create the "God Hook"
export const useITSContext = () => {
  const context = useContext(ITSCoreContext)
  if (!context) throw new Error("useEngine must be used within ITSCoreProvider")
  return context
}