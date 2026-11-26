import type { ReactElement, ReactNode } from 'react'

/**
 * Drafts and published come back as separate rows from a list query: one entry per document, the
 * draft wins (it is what the editor shows). Shared by the list previews that count child
 * documents (product → variants, option group → options).
 */
export function collapseDrafts<T extends { _id: string }>(
  rows: T[],
): { row: T; isDraft: boolean }[] {
  const byId = new Map<string, { row: T; isDraft: boolean }>()
  for (const row of rows) {
    const isDraft = row._id.startsWith('drafts.')
    const id = row._id.replace(/^drafts\./, '')
    if (!byId.has(id) || isDraft) byId.set(id, { row, isDraft })
  }
  return [...byId.values()]
}

const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const

/**
 * List-preview media with a live child summary on top of the image/icon:
 * - badge bottom left: child count; dot bottom right: some child has a draft
 * - `text` as tooltip and as screen-reader text (it ends up in the list link's accessible name, so
 *   the state isn't colour-only)
 */
export function PreviewCountMedia({
  count,
  drafts,
  text,
  children,
}: {
  count?: number
  drafts?: number
  text?: string
  children: ReactNode
}): ReactElement {
  return (
    <span
      title={text}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
      {!!count && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 2,
            bottom: 2,
            minWidth: 14,
            padding: '0 3px',
            borderRadius: 7,
            background: 'rgba(0, 0, 0, 0.78)',
            color: '#fff',
            font: '600 10px/14px system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          {count}
        </span>
      )}
      {!!drafts && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            // Inset so the media frame's rounded, clipped corner doesn't cut it off.
            bottom: 3,
            right: 3,
            width: 11,
            height: 11,
            borderRadius: '50%',
            background: 'var(--card-badge-caution-dot-color, #f59e0b)',
            boxShadow: '0 0 0 2px var(--card-bg-color, #fff)',
          }}
        />
      )}
      {text && <span style={srOnly}>{text}</span>}
    </span>
  )
}
