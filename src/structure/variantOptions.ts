import { map } from 'rxjs'

import { AddIcon, OptionGroupIcon } from '../assets/icons'
import { NewVariantOptionPane } from '../components/products/NewVariantOptionPane'
import type { ITSStructureComponent } from '../types'

export const variantOptionsMenu: ITSStructureComponent = (S, context, ctx) => {
  const apiVersion = ctx.config.apiVersion
  const t = ctx.structureT.default

  // A group opens one live list: the group itself, its options (by sortOrder) and "New option".
  // Same pattern as the product child list. The explicit `child` resolves any id — also a new
  // option's, which isn't in the items until its first edit (see NewVariantOptionPane).
  const getGroupChildView = (groupId: string) =>
    context.documentStore
      .listenQuery(
        `*[_type == "variantOption" && group._ref == $groupId && !(_id in path("versions.**"))]
          | order(sortOrder asc, _createdAt asc)._id`,
        { groupId },
        {},
      )
      .pipe(
        map((ids: string[]) => {
          // Drafts and published come back as separate ids — one item per document.
          const optionIds = [...new Set(ids.map((id) => id.replace(/^drafts\./, '')))]
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

  return S.listItem()
    .title(t('variantOptions.title'))
    .icon(OptionGroupIcon)
    .child(
      S.documentTypeList('variantOptionGroup')
        .title(t('variantOptions.title'))
        .apiVersion(apiVersion)
        // A group created with "+" arrives with its template in the pane params and doesn't exist
        // yet: open its editor directly (the list would show "Missing document"). Opening it
        // again from the list later shows the list.
        .child((groupId, options) =>
          options?.params?.template
            ? S.document().documentId(groupId).schemaType('variantOptionGroup')
            : getGroupChildView(groupId),
        ),
    )
}
