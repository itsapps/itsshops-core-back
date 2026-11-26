import {
  type ComponentType,
  createElement,
  type ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { distinctUntilChanged, map, type Observable, shareReplay } from 'rxjs'
import { type DocumentStore, type Image, useClient, useDocumentStore } from 'sanity'

import type { ITSContext } from '../../types'
import { collapseDrafts, PreviewCountMedia } from '../PreviewCountMedia'
import { createImageBuilder } from '../../utils/imageBuilder'
import { VARIANT_ORDER } from '../../utils/variantOrder'

interface VariantRow {
  _id: string
  status?: string
  image?: Image
}

interface VariantSummary {
  count: number
  drafts: number
  statusCounts: Record<string, number>
  firstImage?: Image
}

const NON_ACTIVE_STATUSES = ['comingSoon', 'soldOut', 'archived'] as const

function summarize(rows: VariantRow[]): VariantSummary {
  const variants = collapseDrafts(rows)
  const statusCounts: Record<string, number> = {}
  let drafts = 0
  let firstImage: Image | undefined
  for (const { row, isDraft } of variants) {
    if (isDraft) drafts++
    const status = row.status ?? 'active'
    statusCounts[status] = (statusCounts[status] ?? 0) + 1
    if (!firstImage && row.image?.asset) firstImage = row.image
  }
  return { count: variants.length, drafts, statusCounts, firstImage }
}

// Subtitle and media of one preview row share one listener per product.
const summaries = new Map<string, Observable<VariantSummary>>()

function summary$(documentStore: DocumentStore, productId: string): Observable<VariantSummary> {
  let obs = summaries.get(productId)
  if (!obs) {
    obs = documentStore
      .listenQuery(
        `*[_type == "productVariant" && product._ref == $productId && !(_id in path("versions.**"))]
          | order(${VARIANT_ORDER}){ _id, status, image }`,
        { productId },
        {},
      )
      .pipe(
        map((rows: VariantRow[]) => summarize(rows ?? [])),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        shareReplay({ bufferSize: 1, refCount: true }),
      )
    summaries.set(productId, obs)
  }
  return obs
}

function useVariantSummary(productId: string): VariantSummary | null {
  const documentStore = useDocumentStore()
  const [summary, setSummary] = useState<VariantSummary | null>(null)
  useEffect(() => {
    const sub = summary$(documentStore, productId).subscribe({
      next: setSummary,
      error: () => setSummary(null),
    })
    return () => sub.unsubscribe()
  }, [documentStore, productId])
  return summary
}

/**
 * Media for the product list preview. Structure document lists render `SanityDefaultPreview`
 * directly (no `components.preview`) and `prepare` must return strings for title/subtitle — only
 * `media` may be a React element. So the live variant summary lives here:
 * - image: the product's own, else the first variant's, else the kind icon
 * - badge + draft dot + tooltip/screen-reader text via `PreviewCountMedia`
 *   ("3 variants · 1 draft · 1 sold out")
 */
export const createProductPreviewMedia = (
  ctx: ITSContext,
): ((productId: string, image: Image | undefined, icon: ComponentType) => ReactElement) => {
  const t = ctx.t.default

  const summaryText = (summary: VariantSummary): string => {
    if (summary.count === 0) return t('product.preview.noVariants', 'No variants')
    return [
      t('product.preview.variants', `${summary.count} variants`, { count: summary.count }),
      ...(summary.drafts > 0
        ? [t('product.preview.drafts', `${summary.drafts} drafts`, { count: summary.drafts })]
        : []),
      ...NON_ACTIVE_STATUSES.filter((s) => summary.statusCounts[s]).map((s) =>
        t(`product.preview.status.${s}`, `${summary.statusCounts[s]} ${s}`, {
          count: summary.statusCounts[s],
        }),
      ),
    ].join(' · ')
  }

  function ProductMedia({
    productId,
    image,
    icon: Icon,
  }: {
    productId: string
    image?: Image
    icon: ComponentType
  }): ReactElement {
    const summary = useVariantSummary(productId)
    const client = useClient({ apiVersion: ctx.config.apiVersion })
    const builder = useMemo(() => createImageBuilder(client), [client])
    const source = image?.asset ? image : summary?.firstImage
    const text = summary ? summaryText(summary) : undefined

    return (
      <PreviewCountMedia count={summary?.count} drafts={summary?.drafts} text={text}>
        {source ? (
          <img
            src={builder.getUrl({ source, width: 80, height: 80 })}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Icon />
        )}
      </PreviewCountMedia>
    )
  }

  return function productMedia(productId, image, icon) {
    return createElement(ProductMedia, { productId, image, icon })
  }
}
