import { ComponentType } from 'react'

import {
  ProductIcon,
  ProductKindBundleIcon,
  ProductKindDigitalIcon,
  ProductKindPhysicalIcon,
  ProductKindWineIcon,
  ProductVariantIcon,
} from '../assets/icons'
// import { WineImporter } from '../components/products/WineImporter'
// import { CreateProductFromWines } from '../components/products/CreateProductFromWines'
import type { ITSStructureComponent, ProductKind } from '../types'
import { getProductReferenceView, getReferenceView } from './structure'

export const productsMenu: ITSStructureComponent = (S, context, ctx) => {
  const apiVersion = ctx.config.apiVersion
  const t = ctx.t.default

  const productKindIcons: Record<ProductKind, ComponentType> = {
    wine: ProductKindWineIcon,
    digital: ProductKindDigitalIcon,
    bundle: ProductKindBundleIcon,
    physical: ProductKindPhysicalIcon,
  }

  const getProductChildView = (productId: string) =>
    S.list()
      .id('editProduct')
      .title(t('products.editProduct'))
      .items([
        S.listItem()
          .title(t('products.productContainer'))
          .icon(ProductIcon)
          .child(
            S.editor()
              .id('product')
              .schemaType('product')
              .documentId(productId)
              .views([
                S.view.form(),
                getProductReferenceView(S, 'sdf', productId),
                getReferenceView(S, t('views.titles.references')),
              ]),
          ),
        // .child(S.document().schemaType('product').documentId(productId)),
        S.listItem()
          .title(t('products.variants'))
          .icon(ProductVariantIcon)
          .child(
            S.documentTypeList('productVariant')
              .title(t('products.variants'))
              .apiVersion(apiVersion)
              .filter('_type == "productVariant" && product._ref == $productId')
              // .canHandleIntent((intentName, params) => {
              //   return intentName === 'edit' && params.type === 'productVariant'
              // })
              .params({ productId }),
          ),
      ])

  return S.listItem()
    .title(t('products.products'))
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
                .title(t('products.products'))
                .apiVersion(apiVersion)
                .filter('_type == "product"')
                .canHandleIntent((intentName, params) => {
                  return intentName === 'edit' && params.type === 'product'
                })
                .child(getProductChildView),
            ),

          S.divider(),

          // Kinds
          ...ctx.config.productKinds.map((kind) =>
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
