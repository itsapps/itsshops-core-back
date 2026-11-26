import { type ComponentType, createElement, type ReactElement, useEffect, useState } from 'react'
import { distinctUntilChanged, map, type Observable, shareReplay } from 'rxjs'
import { type DocumentStore, useDocumentStore } from 'sanity'

import type { ITSContext } from '../../types'
import { collapseDrafts, PreviewCountMedia } from '../PreviewCountMedia'

interface OptionSummary {
  count: number
  drafts: number
}

// One shared listener per group (several preview rows of the same group, re-renders).
const summaries = new Map<string, Observable<OptionSummary>>()

function summary$(documentStore: DocumentStore, groupId: string): Observable<OptionSummary> {
  let obs = summaries.get(groupId)
  if (!obs) {
    obs = documentStore
      .listenQuery(
        `*[_type == "variantOption" && group._ref == $groupId && !(_id in path("versions.**"))]{ _id }`,
        { groupId },
        {},
      )
      .pipe(
        map((rows: { _id: string }[]) => {
          const options = collapseDrafts(rows ?? [])
          return { count: options.length, drafts: options.filter((o) => o.isDraft).length }
        }),
        distinctUntilChanged((a, b) => a.count === b.count && a.drafts === b.drafts),
        shareReplay({ bufferSize: 1, refCount: true }),
      )
    summaries.set(groupId, obs)
  }
  return obs
}

/**
 * Media for the option group list preview — same as the product row (ProductPreview.tsx): the
 * group icon with the live option count and a draft dot ("3 options · 1 draft").
 */
export const createOptionGroupPreviewMedia = (
  ctx: ITSContext,
): ((groupId: string, icon: ComponentType) => ReactElement) => {
  const t = ctx.t.default

  const summaryText = ({ count, drafts }: OptionSummary): string => {
    if (count === 0) return t('variantOptionGroup.preview.noOptions', 'No options')
    return [
      t('variantOptionGroup.preview.options', `${count} options`, { count }),
      ...(drafts > 0
        ? [t('variantOptionGroup.preview.drafts', `${drafts} drafts`, { count: drafts })]
        : []),
    ].join(' · ')
  }

  function OptionGroupMedia({
    groupId,
    icon: Icon,
  }: {
    groupId: string
    icon: ComponentType
  }): ReactElement {
    const documentStore = useDocumentStore()
    const [summary, setSummary] = useState<OptionSummary | null>(null)
    useEffect(() => {
      const sub = summary$(documentStore, groupId).subscribe({
        next: setSummary,
        error: () => setSummary(null),
      })
      return () => sub.unsubscribe()
    }, [documentStore, groupId])

    return (
      <PreviewCountMedia
        count={summary?.count}
        drafts={summary?.drafts}
        text={summary ? summaryText(summary) : undefined}
      >
        <Icon />
      </PreviewCountMedia>
    )
  }

  return function optionGroupMedia(groupId, icon) {
    return createElement(OptionGroupMedia, { groupId, icon })
  }
}
