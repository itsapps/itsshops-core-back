import { ITSContext, ITSProviderContext } from '../types'
import { createContext, useContext, useMemo } from 'react'
import { useTranslation } from 'sanity'
import { createFrontendClient } from '../external/frontend'

// import { useCurrentLocale } from './your-locale-hook' // Replace with your actual hook


const ITSCoreContext = createContext<ITSProviderContext | null>(null)

export const ITSCoreProvider = ({ children, ctx }: { children: React.ReactNode, ctx: ITSContext }) => {
  const { t } = useTranslation('itsapps')
  // const locale = useCurrentLocale().id.substring(0, 2)

  // Memoize the Netlify client so it doesn't recreate on every render
  // const netlify = useMemo(() => NetlifyClient({
  //   accessToken: config.netlify.token,
  //   siteId: config.netlify.siteId
  // }), [config.netlify])

  // const value = useMemo(() => ({
  //   config,
  //   // locale,
  //   t,
  //   // netlify
  // }), [config, t])
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