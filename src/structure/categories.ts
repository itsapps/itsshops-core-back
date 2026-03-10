import { CategoryIcon, EditIcon } from '../assets/icons'
import type { ITSStructureComponent } from '../types'

export const categoriesMenu: ITSStructureComponent = (S, context, ctx) => {
  const apiVersion = ctx.config.apiVersion
  const t = ctx.structureT.default
  const tSchema = ctx.schemaT
  const client = context.getClient({ apiVersion })

  const getCategoryMenuItems = (id: string) => {
    const customEditButton = S.menuItem()
      .title(
        context.i18n.t('inputs.array.action.edit', {
          itemTypeTitle: tSchema.default('category.title'),
        }),
      )
      .showAsAction(true)
      .icon(EditIcon)
      .intent({
        type: 'edit',
        params: { id, type: 'category' },
      })

    const defaultItems = S.documentTypeList(`category`).getMenuItems()
    return [...(defaultItems ?? []), customEditButton]
  }

  const subCategoryList = async (categoryId: string) => {
    const category = await client.fetch(`*[_id == $id][0]{title}`, { id: categoryId })
    const title = ctx.localizer.value(category?.title) || tSchema.default('category.title')

    return S.documentTypeList('category')
      .title(title)
      .apiVersion(apiVersion)
      .defaultOrdering([{ field: 'sortOrder', direction: 'asc' }])
      .filter('parent._ref == $categoryId')
      .params({ categoryId })
      .menuItems(getCategoryMenuItems(categoryId))
      .canHandleIntent(() => false)
      .initialValueTemplates([
        S.initialValueTemplateItem('subCategory', { parentCategoryId: categoryId }),
      ])
      .child(subCategoryList)
  }

  return S.listItem()
    .title(t('categories.title'))
    .icon(CategoryIcon)
    .child(
      S.documentTypeList('category')
        .title(t('categories.title'))
        .apiVersion(apiVersion)
        .defaultOrdering([{ field: 'sortOrder', direction: 'asc' }])
        .filter('_type == "category" && !defined(parent)')
        .canHandleIntent(() => false)
        .child(subCategoryList),
    )
}
