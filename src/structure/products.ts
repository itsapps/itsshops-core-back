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

export const productsMenu: ITSStructureComponent = (S, context, ctx) => {
  const apiVersion = ctx.config.apiVersion
  const t = ctx.t.default

  const productKindIcons: Record<ProductKind, ComponentType> = {
    wine: ProductKindWineIcon,
    digital: ProductKindDigitalIcon,
    bundle: ProductKindBundleIcon,
    physical: ProductKindPhysicalIcon,
  }

  return S.listItem()
    .title(t('products.products'))
    .icon(ProductIcon)
    .child(
      S.list()
        .title(t('products.kinds.title'))
        .items(
          ctx.config.productKinds.map((kind) =>
            S.listItem()
              .title(t(`products.kinds.list.${kind}`))
              .icon(productKindIcons[kind])
              // PANE 2: Show Products of this Kind
              .child(
                S.documentTypeList('product')
                  .title(t(`products.kinds.list.${kind}`))
                  .apiVersion(apiVersion)
                  .filter('_type == "product" && kind == $kind')
                  .params({ kind })
                  // PANE 3: The Magic "Split" View
                  .child((productId) =>
                    S.list()
                      .id('editProduct')
                      .title(t('products.product'))
                      .items([
                        // Option 1: Edit the Product Details
                        S.listItem()
                          .title(t('products.productContainer'))
                          .child(S.document().schemaType('product').documentId(productId)),
                        // Option 2: View/Edit the 1,000 Variants
                        S.listItem()
                          .title(t('products.variants'))
                          .icon(ProductVariantIcon)
                          .child(
                            S.documentTypeList('productVariant')
                              .title(t('products.variants'))
                              .apiVersion(apiVersion)
                              .filter('_type == "productVariant" && product._ref == $productId')
                              .params({ productId }),
                            // .initialValueTemplates([
                            //   S.initialValueTemplateItem('variant-with-parent', { productId })
                            // ]),
                          ),
                      ]),
                  ),
              ),
          ),
        ),
    )
}
