import { defer, distinctUntilChanged, map } from 'rxjs'

import { AddIcon, OptionGroupIcon } from '../assets/icons'
import { DeletedDocumentPane } from '../components/DeletedDocumentPane'
import { NewVariantOptionPane } from '../components/products/NewVariantOptionPane'
import type { ITSStructureComponent } from '../types'

export const variantOptionsMenu: ITSStructureComponent = (S, context, ctx) => {
  const apiVersion = ctx.config.apiVersion
  const t = ctx.structureT.default

  // A group opens one live list: the group itself, its options (by sortOrder) and "New option".
  // Same pattern as the product child list. The explicit `child` resolves any id — also a new
  // option's, which isn't in the items until its first edit (see NewVariantOptionPane).
  //
  // `isNew`: the group list's "+" (`params.template`) — a group that doesn't exist yet opens its
  // editor directly (the list would show "Missing document"). The choice is made inside the
  // stream, per subscription: Sanity caches a resolved pane per id **without its params**, so a
  // choice made when resolving would stick — after saving, opening the group again from the list
  // would still show the form. Re-opening re-subscribes, and the group exists by then → list.
  // A group that existed and is gone (deleted) shows a notice instead of a "Missing document".
  const getGroupChildView = (groupId: string, isNew: boolean) =>
    defer(() => {
      let mode: 'editor' | 'list' | undefined
      return context.documentStore
        .listenQuery(
          {
            fetch: `{
              "exists": count(*[_id in [$groupId, "drafts." + $groupId]]) > 0,
              "optionIds": *[_type == "variantOption" && group._ref == $groupId && !(_id in path("versions.**"))]
                | order(sortOrder asc, _createdAt asc)._id
            }`,
            // Also the group itself: its deletion must reach the list
            listen: `*[_id in [$groupId, "drafts." + $groupId] || (_type == "variantOption" && group._ref == $groupId)]`,
          },
          { groupId },
          {},
        )
        .pipe(
          map((res: { exists: boolean; optionIds: string[] | null }) => {
            // Decided on the first result: a new group stays in its editor while it's being
            // created (its first edit makes it exist — that must not swap the pane)
            mode ??= isNew && !res.exists ? 'editor' : 'list'
            return {
              mode,
              exists: res.exists,
              // Drafts and published come back as separate ids — one item per document.
              optionIds: [
                ...new Set((res.optionIds ?? []).map((id) => id.replace(/^drafts\./, ''))),
              ],
            }
          }),
          // `listen` fires on every edit (typing in an editor): re-build only on a visible change
          distinctUntilChanged(
            (a, b) =>
              a.mode === b.mode &&
              (a.mode === 'editor' ||
                (a.exists === b.exists && a.optionIds.join() === b.optionIds.join())),
          ),
          map(({ mode: m, exists, optionIds }) => {
            if (m === 'editor') {
              return S.document().documentId(groupId).schemaType('variantOptionGroup')
            }
            if (!exists) {
              return S.component(DeletedDocumentPane)
                .id('variantOptionGroupDeleted')
                .title(t('variantOptions.edit'))
                .options({ text: t('variantOptions.deleted') })
            }
            return S.list()
              .id('editVariantOptionGroup')
              .title(t('variantOptions.edit'))
              .items([
                S.documentListItem().id(groupId).schemaType('variantOptionGroup'),
                S.divider(),
                ...optionIds.map((id) => S.documentListItem().id(id).schemaType('variantOption')),
                S.divider(),
                S.listItem().id('addOption').title(t('variantOptions.addOption')).icon(AddIcon),
              ])
              .child((id) => {
                if (id === 'addOption') {
                  return S.component(NewVariantOptionPane)
                    .id('addOption')
                    .title(t('variantOptions.addOption'))
                    .options({ groupId })
                }
                return S.document()
                  .documentId(id)
                  .schemaType(id === groupId ? 'variantOptionGroup' : 'variantOption')
              })
          }),
        )
    })

  return S.listItem()
    .title(t('variantOptions.title'))
    .icon(OptionGroupIcon)
    .child(
      S.documentTypeList('variantOptionGroup')
        .title(t('variantOptions.title'))
        .apiVersion(apiVersion)
        // "+" passes its template in the pane params (see getGroupChildView)
        .child((groupId, options) => getGroupChildView(groupId, !!options?.params?.template)),
    )
}
