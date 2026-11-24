import { OptionGroupIcon, OptionIcon } from '../assets/icons'
import type { ITSStructureComponent } from '../types'

export const variantOptionsMenu: ITSStructureComponent = (S, context, ctx) => {
  const apiVersion = ctx.config.apiVersion
  const t = ctx.structureT.default

  return S.listItem()
    .title(t('variantOptions.title'))
    .icon(OptionGroupIcon)
    .child(
      S.documentTypeList('variantOptionGroup')
        .title(t('variantOptions.title'))
        .child((groupId) =>
          S.list()
            .title(t('variantOptions.title'))
            .items([
              S.listItem()
                .title(t('variantOptions.title'))
                .icon(OptionGroupIcon)
                .child(S.document().schemaType('variantOptionGroup').documentId(groupId)),
              S.listItem()
                .title(t('variantOptions.options'))
                .icon(OptionIcon)
                .child(
                  S.documentList()
                    .title(t('variantOptions.options'))
                    .apiVersion(apiVersion)
                    .filter('_type == "variantOption" && group._ref == $groupId')
                    .params({ groupId })
                    .initialValueTemplates([
                      S.initialValueTemplateItem('variantOption-by-group', { groupId }),
                    ]),
                ),
            ]),
        ),
    )
}
