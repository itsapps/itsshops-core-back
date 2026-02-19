import { ITSLocaleContext, ITSProviderContext } from '../types'
import { createContext, useContext, useMemo } from 'react'
import { useTranslation, useClient, type SanityClient } from 'sanity'
import { createFrontendClient } from '../external/frontend'
import { createVinofactClient } from '../external/vinofact'
import { createImageBuilder } from '../utils/imageBuilder'

// import { useCurrentLocale } from './your-locale-hook' // Replace with your actual hook


const ITSCoreContext = createContext<ITSProviderContext | null>(null)

export const ITSCoreProvider = ({ children, ctx }: { children: React.ReactNode, ctx: ITSLocaleContext }) => {
  const { t } = useTranslation('itsapps')
  const baseClient: SanityClient = useClient({ apiVersion: ctx.config.apiVersion })
  const isDev = ctx.config.isDev
  
  const sanityClient = useMemo(() => {
    if (!isDev) return baseClient;

    // We create a Proxy that behaves exactly like the baseClient
    return new Proxy(baseClient, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        // Only intercept the 'fetch' method
        if (prop === 'fetch' && typeof value === 'function') {
          return async (...args: any[]) => {
            const [query, params] = args;
            
            const start = performance.now();
            
            if (isDev) {
              console.groupCollapsed(`🔍 GROQ: ${query.substring(0, 50)}...`);
              console.log('Query:', query);
              console.log('Params:', params);
            }

            try {
              const result = await value.apply(target, args);
              
              if (isDev) {
                const duration = (performance.now() - start);
                // Performance warning: highlight slow queries in red
                const color = duration > 500 ? 'color: #ff4d4f; font-weight: bold;' : 'color: #2a7e39;';
                console.log(`%c✅ Result (${duration.toFixed(2)}ms)`, color, result);
              }
              
              return result;
            } catch (err) {
              console.error('❌ GROQ Error:', err);
              throw err;
            } finally {
              if (isDev) {
                console.groupEnd();
              }
            }
          };
        }
        
        // For all other properties (clone, config, etc.), return them as-is
        // If it's a function, we must bind it to the target to keep 'this' context
        return typeof value === 'function' ? value.bind(target) : value;
      }
    }) as SanityClient; // Type assertion is safe now because the Proxy implements the interface
  }, [baseClient, isDev]);

  const imageBuilder = useMemo(() => createImageBuilder(sanityClient), [sanityClient]);
  
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
    sanityClient,
    imageBuilder,
    frontendClient,
    vinofactClient,
  }), [ctx, t, sanityClient, imageBuilder, frontendClient, vinofactClient]);

  return <ITSCoreContext.Provider value={value}>{children}</ITSCoreContext.Provider>
}

// 2. Create the "God Hook"
export const useITSContext = () => {
  const context = useContext(ITSCoreContext)
  if (!context) throw new Error("useEngine must be used within ITSCoreProvider")
  return context
}