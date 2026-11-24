/**
 * Product action "Flaschenbilder aus VinoFact übernehmen": copies the VinoFact bottle image into
 * every wine variant of the product that has a VinoFact id and no image yet. Writes into the
 * variant's draft when one exists, else the published variant (`productVariant` isn't liveEdit —
 * a patch to published under a draft would be lost when the draft is published).
 */
import { useToast } from '@sanity/ui/toast'
import { useCallback, useState } from 'react'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

import { ImageIcon } from '../../assets/icons'
import { useITSContext } from '../../context/ITSCoreProvider'
import {
  bottleImageTargets,
  type BottleImageVariantRow,
  importBottleImages,
} from '../../lib/shop/vinofactImage'
import { useBottleImageSummary } from './useBottleImageImport'

// Raw perspective: drafts and published side by side (release versions excluded).
const VARIANTS_QUERY = `*[_type == "productVariant" && product._ref == $id && kind == "wine" && !(_id in path("versions.**"))]{
  _id, "wineId": wine.vinofactWineId, "hasImage": defined(image.asset), "existingAlt": image.alt
}`

export const ImportBottleImagesAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, draft, published } = props
  const { sanityClient, vinofactClient, componentT, config } = useITSContext()
  const t = componentT.default
  const toast = useToast()
  const showSummary = useBottleImageSummary()
  const [running, setRunning] = useState(false)

  const product = (draft ?? published) as { kind?: string } | null

  const handle = useCallback(async () => {
    if (!vinofactClient) {
      toast.push({
        status: 'error',
        title: t('vinofact.notInitialized.title'),
        description: t('vinofact.notInitialized.description'),
      })
      return
    }
    setRunning(true)
    try {
      const rows = await sanityClient.fetch<BottleImageVariantRow[]>(
        VARIANTS_QUERY,
        { id },
        { perspective: 'raw' },
      )
      const targets = bottleImageTargets(rows)
      if (!targets.length) {
        toast.push({ status: 'info', title: t('vinofact.bottleImages.allHaveImage') })
        return
      }
      const result = await importBottleImages(
        { client: sanityClient, vinofactClient, locales: config.localization.fieldLocales },
        targets,
      )
      showSummary(result)
    } catch (err) {
      toast.push({
        status: 'error',
        title: t('vinofact.importFailed.title'),
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setRunning(false)
    }
  }, [vinofactClient, sanityClient, id, config.localization.fieldLocales, toast, t, showSummary])

  if (product?.kind !== 'wine') return null

  return {
    label: t(running ? 'vinofact.bottleImages.running' : 'vinofact.bottleImages.action'),
    icon: ImageIcon,
    disabled: running || !published,
    title: published ? undefined : t('vinofact.bottleImages.notPublished'),
    onHandle: handle,
  }
}
