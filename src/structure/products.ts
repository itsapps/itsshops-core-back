import { map, scan } from 'rxjs'

import { AddIcon, ProductIcon, productKindIcons } from '../assets/icons'
import { AddVariantsPane } from '../components/products/AddVariantsPane'
import { ProductDeletedPane } from '../components/products/ProductDeletedPane'
import type { ITSStructureComponent } from '../types'
import { VARIANT_ORDER } from '../utils/variantOrder'

export const productsMenu: ITSStructureComponent = (S, context, ctx) => {
  const apiVersion = ctx.config.apiVersion
  const t = ctx.structureT.default

  // EXPERIMENT: product + its variants in one list. A mixed documentList can only sort by fields
  // every type has (Sanity rejects `wine.*` on `product`), so the list is built from a live query.
  //
  // The product item stays in the list even when the product doesn't exist: that is how a new
  // product ("Neu: Produkt" from the list) is edited before its first save. Once the product
  // existed and is gone (deleted, draft discarded), the list is replaced by a notice — its
  // "Missing document" item would let an editor create a new product with the old id.
  const getProductChildView = (productId: string) =>
    context.documentStore
      .listenQuery(
        `{
          "exists": count(*[_id in [$productId, "drafts." + $productId]]) > 0,
          "variantIds": *[_type == "productVariant" && product._ref == $productId && !(_id in path("versions.**"))]
            | order(${VARIANT_ORDER})._id
        }`,
        { productId },
        {},
      )
      .pipe(
        scan(
          (state: { seen: boolean; gone: boolean; ids: string[] }, res: any) => ({
            seen: state.seen || res.exists,
            gone: (state.seen || res.exists) && !res.exists,
            ids: res.variantIds ?? [],
          }),
          { seen: false, gone: false, ids: [] },
        ),
        map(({ gone, ids }: { gone: boolean; ids: string[] }) => {
          if (gone) {
            return S.component(ProductDeletedPane).id('productDeleted').title(t('products.edit'))
          }
          // Drafts and published come back as separate ids — one item per document.
          const variantIds = [...new Set(ids.map((id) => id.replace(/^drafts\./, '')))]
          return S.list()
            .id('editProduct')
            .title(t('products.edit'))
            .items([
              S.documentListItem().id(productId).schemaType('product'),
              S.divider(),
              ...variantIds.map((id) => S.documentListItem().id(id).schemaType('productVariant')),
              S.divider(),
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
        }),
      )

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
