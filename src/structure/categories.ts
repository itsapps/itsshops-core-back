import type { StructureBuilder } from 'sanity/structure'
import { sanityApiVersion } from '../utils/constants'
import { SchemaIcon, EditIcon } from '@sanity/icons'
import type { ITSContext } from '../types';

export const categoriesMenu = (S: StructureBuilder, context: any, ctx: ITSContext) => {
  const client = context.getClient({ apiVersion: sanityApiVersion });

  const getCategoryMenuItems = (id: string) => {
    const customEditButton = S.menuItem()
      .title(ctx.helpers.t.default('structure:editCategory'))
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
    const category = await client.getDocument(categoryId)

    return S.documentTypeList('category')
      .title(category.name)
      .apiVersion(sanityApiVersion)
      .defaultOrdering([{field: 'sortOrder', direction: 'asc'}])
      .filter('parent._ref == $categoryId')
      .params({ categoryId })
      .menuItems(getCategoryMenuItems(categoryId))
      .canHandleIntent(() => false)
      .initialValueTemplates([
        S.initialValueTemplateItem(
          'subCategory',
          { parentCategoryId: categoryId }
        )
      ])
      .child(subCategoryList)
  }

  return S.listItem()
    .title(ctx.helpers.t.default('structure:categories'))
    .icon(SchemaIcon)
    .child(
      S.documentTypeList('category')
        .title(ctx.helpers.t.default('structure:categories'))
        .apiVersion(sanityApiVersion)
        .defaultOrdering([{field: 'sortOrder', direction: 'asc'}])
        .filter('_type == "category" && !defined(parent)')
        .canHandleIntent(() => false)
        .child(subCategoryList)
    )
}