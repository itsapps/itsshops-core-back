import {
  ComponentViewBuilder,
  ListBuilder,
  ListItem,
  ListItemBuilder,
  StructureBuilder,
  StructureResolverContext,
} from 'sanity/structure'
import DocumentsPane from 'sanity-plugin-documents-pane'

import type { ITSContext, ITSStructureItem } from '../types'
import { isDefined } from '../utils'

type DividerBuilder = ReturnType<StructureBuilder['divider']>

const sortItems = (items: ITSStructureItem[]): ITSStructureItem[] => {
  // 1. Separate items by their basic positioning intent
  const topItems = items.filter((i) => i.position?.anchor === 'top')
  const bottomItems = items.filter((i) => i.position?.anchor === 'bottom')

  // These are items that don't have a specific anchor or are the "standard" core items
  const baseItems = items.filter((i) => !i.position?.anchor)

  // These are the items trying to "hook" onto a specific ID
  const anchoredItems = items.filter(
    (i) => i.position?.anchor && !['top', 'bottom'].includes(i.position.anchor),
  )

  // 2. Start our sorted list with Top + Base items
  const sorted = [...topItems, ...baseItems]

  // 3. Iteratively place anchored items (handles dependencies)
  let remaining = [...anchoredItems]
  let changed = true
  while (changed && remaining.length > 0) {
    changed = false
    const nextRemaining: typeof remaining = []

    for (const item of remaining) {
      const anchorId = item.position?.anchor
      const anchorIndex = sorted.findIndex((s) => s.id === anchorId)

      if (anchorIndex === -1) {
        nextRemaining.push(item)
      } else {
        const insertAt = item.position?.placement === 'before' ? anchorIndex : anchorIndex + 1
        sorted.splice(insertAt, 0, item)
        changed = true
      }
    }

    remaining = nextRemaining
  }

  // 4. Fallback: If any items have invalid anchors, append them before the bottom items
  // This ensures a typo in 'anchor: "shopp"' doesn't delete the document from the UI
  return [...sorted, ...remaining, ...bottomItems]
}

export const fromRegistry = (ctx: ITSContext, id: string): ITSStructureItem => {
  const doc = ctx.featureRegistry.getDoc(id)

  if (!doc) {
    // Fallback for custom items not in registry
    return { type: 'document', id, hidden: false }
  }

  const extension = ctx.config.schemaExtensions?.[id]
  const icon = extension?.icon ?? doc.icon

  return {
    type: doc.isSingleton ? 'singleton' : 'document',
    id: doc.name,
    icon,
    feature: doc.feature,
    hidden: doc.hideInStructure && !ctx.config.isDev,
  }
}

export const isDocHidden = (ctx: ITSContext, id: string): boolean => {
  if (ctx.config.isDev) return false
  const doc = ctx.featureRegistry.getDoc(id)

  if (!doc) {
    return false
  }

  return doc.hideInStructure || false
}

const resolveItem = (
  item: ITSStructureItem,
  S: StructureBuilder,
  context: StructureResolverContext,
  ctx: ITSContext,
): ListItem | ListItemBuilder | DividerBuilder | null => {
  /// 1. Feature Guard
  if (item.feature && !ctx.featureRegistry.isFeatureEnabled(item.feature)) return null
  if (item.type === 'document' && !ctx.featureRegistry.isDocEnabled(item.id)) return null
  // if (item.hidden) return null;
  if (item.hidden && !ctx.config.isDev) return null

  const title = item.title
    ? ctx.structureT.default(item.title)
    : ctx.structureT.default(`${item.id}.title`)

  switch (item.type) {
    case 'divider':
      return S.divider()

    case 'singleton': {
      // Safety: check if the schema type exists in Sanity
      const schemaExists = context.schema.has(item.id)
      if (!schemaExists) {
        console.warn(`Structure Error: Schema type "${item.id}" not found for singleton.`)
        return null
      }

      return S.listItem()
        .title(title)
        .icon(item.icon)
        .child(S.editor().id(item.id).schemaType(item.id).documentId(item.id))
    }
    case 'group': {
      const sorted = sortItems(item.children || [])
      const resolved = sorted.map((c) => resolveItem(c, S, context, ctx)).filter(isDefined)

      // If the group is empty (no enabled features/docs), hide the group entirely
      if (resolved.length === 0) return null

      return S.listItem()
        .title(title)
        .icon(item.icon)
        .child(S.list().id(item.id).title(title).items(resolved))
    }
    case 'custom': {
      return item.component?.(S, context, ctx) ?? null
    }
    // document
    default: {
      return S.documentTypeListItem(item.id).title(title).icon(item.icon)
    }
  }
}

const mergeManifests = (
  core: ITSStructureItem[],
  customer: ITSStructureItem[],
): ITSStructureItem[] => {
  const merged = [...core]

  customer.forEach((customItem) => {
    const coreIndex = merged.findIndex((i) => i.id === customItem.id)

    if (coreIndex === -1) {
      merged.push(customItem)
    } else {
      const coreItem = merged[coreIndex]
      // If BOTH have children, we need to merge the children arrays too
      if (coreItem.children && customItem.children) {
        merged[coreIndex] = {
          ...coreItem,
          ...customItem,
          children: mergeManifests(coreItem.children, customItem.children), // Recursive merge!
        }
      } else {
        // Otherwise, standard overwrite (for position, icon, etc.)
        merged[coreIndex] = { ...coreItem, ...customItem }
      }
    }
  })

  return merged
}

export const localizedStructure = (ctx: ITSContext, coreManifest: ITSStructureItem[]) => {
  return (S: StructureBuilder, context: StructureResolverContext): ListBuilder => {
    // 2. Combine and Sort
    const customerManifest = ctx.config.structure || []
    // 1. Merge (to allow overrides like changing position)
    const mergedManifest = mergeManifests(coreManifest, customerManifest)
    const fullManifest = sortItems(mergedManifest)

    // 3. Resolve to Sanity UI
    const items = fullManifest.map((item) => resolveItem(item, S, context, ctx)).filter(isDefined)

    return S.list().id('root').title(ctx.structureT.default('content.title')).items(items)
  }
}

export const getReferenceView = (S: StructureBuilder, title: string): ComponentViewBuilder =>
  S.view
    .component(DocumentsPane)
    .options({
      query: `*[references($id)]`,
      params: { id: `_id` },
      options: {
        perspective: 'published',
      },
    })
    .title(title)

export const getProductReferenceView = (S: StructureBuilder, title: string): ComponentViewBuilder =>
  S.view
    .component(DocumentsPane)
    .options({
      query: `*[ _type == "productVariant" && product._ref == $id ] | order(_updatedAt asc)`,
      params: { id: '_id' },
      useDraft: false,
    })
    .title(title)
