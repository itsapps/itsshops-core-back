import { useToast } from '@sanity/ui/toast'
import { useCallback } from 'react'

import { useITSContext } from '../../context/ITSCoreProvider'
import {
  type BottleImageImportResult,
  type BottleImageTarget,
  importBottleImages,
} from '../../lib/shop/vinofactImage'

/** The summary toast of a bottle image import ("3 übernommen, 1 ohne Bild in VinoFact, 0 Fehler"). */
export function useBottleImageSummary(): (result: BottleImageImportResult) => void {
  const { componentT } = useITSContext()
  const toast = useToast()
  return useCallback(
    (result: BottleImageImportResult) => {
      toast.push({
        status: result.failed > 0 ? 'warning' : 'success',
        title: componentT.default('vinofact.bottleImages.summaryTitle'),
        description: componentT.default('vinofact.bottleImages.summary', undefined, { ...result }),
      })
    },
    [componentT, toast],
  )
}

/**
 * Import bottle images right after the Product Manager created wine variants (they're always
 * published, so the published ids are patched). Runs in the background — not awaited by the
 * submit, so the form resets / the dialog closes as before; the toasts outlive an unmount. A
 * failure never undoes the product.
 */
export function useBackgroundBottleImport(): (targets: BottleImageTarget[]) => void {
  const { sanityClient, vinofactClient, componentT, config } = useITSContext()
  const toast = useToast()
  const showSummary = useBottleImageSummary()
  return useCallback(
    (targets: BottleImageTarget[]) => {
      if (!vinofactClient || !targets.length) return
      importBottleImages(
        { client: sanityClient, vinofactClient, locales: config.localization.fieldLocales },
        targets,
      )
        .then(showSummary)
        .catch((err: unknown) => {
          toast.push({
            status: 'error',
            title: componentT.default('vinofact.importFailed.title'),
            description: err instanceof Error ? err.message : String(err),
          })
        })
    },
    [
      sanityClient,
      vinofactClient,
      config.localization.fieldLocales,
      showSummary,
      toast,
      componentT,
    ],
  )
}
