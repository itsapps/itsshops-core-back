import { EditIcon, PackageIcon } from '@sanity/icons'

import { WineImporter } from '../components/products/WineImporter'
// import { CreateProductFromWines } from '../components/products/CreateProductFromWines'
import type { ITSStructureComponent } from '../types'

export const productsMenu: ITSStructureComponent = (S, context, ctx) => {
  // const apiVersion = ctx.config.apiVersion
  const t = ctx.t.default
  // const client = context.getClient({ apiVersion })

  // const wineImportPane = () =>
  //   S.listItem()
  //     .title('Wine Import')
  //     .child(S.component(CreateProductFromWines).title('Import Wines'))

  // const getMenuItems = () => {
  //   const customEditButton = S.menuItem()
  //     .title('Import from Wines')
  //     // .action('importWines')
  //     .showAsAction(true)
  //     .icon(EditIcon)
  //     .intent({ type: 'importWines' })

  //   const defaultItems = S.documentTypeList(`product`).getMenuItems()
  //   return [...(defaultItems ?? []), customEditButton]
  //   // return [customEditButton]
  // }

  // return S.documentTypeList('product')
  //   .title(t('products'))
  //   .apiVersion(apiVersion)
  //   .menuItems([S.menuItem().title('Import Wines').action('importWines').icon(PackageIcon)])

  return S.listItem()
    .title(t('products'))
    .icon(PackageIcon)
    .child(
      S.list()
        .title(t('products'))
        .items([
          S.listItem().title(t('products')).icon(PackageIcon).child(S.documentTypeList('product')),
          S.listItem()
            .title('Import via API')
            .child(S.component(WineImporter).title('Import Wines')),
        ]),
    )
  // return S.listItem()
  //   .title(t('products'))
  //   .icon(PackageIcon)
  //   .child(() => {
  //     // if (context.intent === 'importWines') {
  //     //   return S.component(CreateProductFromWines)
  //     //     .title('Import Wines')
  //     // }

  //     return S.documentTypeList('product')
  //       .title(t('products'))
  //       .apiVersion(apiVersion)
  //       .menuItems(getMenuItems())
  //   })

  // return S.listItem()
  //   .title(t('products'))
  //   .icon(PackageIcon)
  //   .child(
  //     S.documentTypeList('product')
  //       .title(t('products'))
  //       .apiVersion(apiVersion)
  //       // .menuItems([S.menuItem().title('Import Wines').action('importWines').icon(PackageIcon)]),
  //       //   // .defaultOrdering([{ field: 'sortOrder', direction: 'asc' }])
  //       .menuItems(getMenuItems())
  //       .canHandleIntent((intentName) => {
  //         return intentName === 'importWines'
  //       }),
  //     //   .canHandleIntent(() => false),
  //     // // .child(subCategoryList),
  //   )
}
