import { map } from 'rxjs'

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
  // Products are only created by the Product Manager (the list has no "New"), so a product that
  // doesn't exist (draft or published) was deleted: the list becomes a notice — its product item
  // would stay as a "Missing document" whose editor creates a new product with the old id.
  // `listen` also covers the product itself: the fetch query's variant filter would never fire
  // on the product's deletion.
  const getProductChildView = (productId: string) =>
    context.documentStore
      .listenQuery(
        {
          fetch: `{
            "exists": count(*[_id in [$productId, "drafts." + $productId]]) > 0,
            "variantIds": *[_type == "productVariant" && product._ref == $productId && !(_id in path("versions.**"))]
              | order(${VARIANT_ORDER})._id
          }`,
          listen: `*[_id in [$productId, "drafts." + $productId] || (_type == "productVariant" && product._ref == $productId)]`,
        },
        { productId },
        {},
      )
      .pipe(
        map((res: { exists: boolean; variantIds: string[] | null }) => {
          if (!res.exists) {
            return S.component(ProductDeletedPane).id('productDeleted').title(t('products.edit'))
          }
          const ids = res.variantIds ?? []
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
