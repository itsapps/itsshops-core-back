import { OptionGroupIcon, OptionIcon } from '../assets/icons'
import type { ITSStructureComponent } from '../types'

export const variantOptionsMenu: ITSStructureComponent = (S, context, ctx) => {
  const apiVersion = ctx.config.apiVersion
  const t = ctx.t.default

  return S.listItem()
    .title(t('variantOptions.groups'))
    .icon(OptionGroupIcon)
    .child(
      S.documentTypeList('variantOptionGroup')
        .title(t('variantOptions.groups'))
        .child((groupId) =>
          S.list()
            .title(t('variantOptions.group'))
            .items([
              S.listItem()
                .title(t('variantOptions.group'))
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
