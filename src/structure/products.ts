import { AddIcon, ProductIcon, productKindIcons, ProductVariantIcon } from '../assets/icons'
import { AddVariantsPane } from '../components/products/AddVariantsPane'
import type { ITSStructureComponent } from '../types'
import { getReferenceView } from './structure'

export const productsMenu: ITSStructureComponent = (S, context, ctx) => {
  const apiVersion = ctx.config.apiVersion
  const t = ctx.structureT.default

  const getProductChildView = (productId: string) =>
    S.list()
      .id('editProduct')
      .title(t('products.edit'))
      .items([
        S.listItem()
          .title(t('products.productContainer'))
          .icon(ProductIcon)
          .child(
            S.editor()
              .id('product')
              .schemaType('product')
              .documentId(productId)
              .views([S.view.form(), getReferenceView(S, t('views.titles.references'))]),
          ),
        S.listItem()
          .title(t('products.variants'))
          .icon(ProductVariantIcon)
          .child(
            S.documentTypeList('productVariant')
              .title(t('products.variants'))
              .defaultOrdering([
                { field: 'wine.vintage', direction: 'desc' },
                { field: 'wine.vintage', direction: 'asc' },
                { field: 'wine.volume', direction: 'desc' },
                { field: 'wine.volume', direction: 'asc' },
              ])
              .apiVersion(apiVersion)
              .filter('_type == "productVariant" && product._ref == $productId')
              .params({ productId }),
          ),
        S.listItem()
          .id('addVariant')
          .title(t('products.addVariant'))
          .icon(AddIcon)
          .child(
            S.component(AddVariantsPane)
              .id('addVariantPane')
              .title(t('products.addVariant'))
              .options({ productId }),
          ),
      ])

  const kinds = ctx.config.schemaSettings.productKinds

  if (kinds.length <= 1) {
    return S.listItem()
      .title(t('products.title'))
      .icon(ProductIcon)
      .child(
        S.documentTypeList('product')
          .title(t('products.title'))
          .apiVersion(apiVersion)
          .filter('_type == "product"')
          .canHandleIntent((intentName, params) => {
            return intentName === 'edit' && params.type === 'product'
          })
          .child(getProductChildView),
      )
  }

  return S.listItem()
    .title(t('products.title'))
    .icon(ProductIcon)
    .child(
      S.list()
        .title(t('products.kinds.title'))
        .items([
          // All products
          S.listItem()
            .title(t('products.kinds.list.all'))
            .icon(ProductIcon)
            .child(
              S.documentTypeList('product')
                .title(t('products.kinds.list.all'))
                .apiVersion(apiVersion)
                .filter('_type == "product"')
                .canHandleIntent((intentName, params) => {
                  return intentName === 'edit' && params.type === 'product'
                })
                .child(getProductChildView),
            ),

          S.divider(),

          // Kinds
          ...kinds.map((kind) =>
            S.listItem()
              .title(t(`products.kinds.list.${kind}`))
              .icon(productKindIcons[kind])
              .child(
                S.documentTypeList('product')
                  .title(t(`products.kinds.list.${kind}`))
                  .apiVersion(apiVersion)
                  .filter('_type == "product" && kind == $kind')
                  .params({ kind })
                  .child(getProductChildView),
              ),
          ),
        ]),
    )
}
