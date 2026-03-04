import {
  DownloadSimpleIcon,
  PackageIcon as KindPackageIcon,
  SlidersHorizontalIcon,
  StackIcon,
  WineIcon,
} from '@phosphor-icons/react'
import { PackageIcon } from '@sanity/icons'
import { ComponentType } from 'react'

// import { WineImporter } from '../components/products/WineImporter'
// import { CreateProductFromWines } from '../components/products/CreateProductFromWines'
import type { ITSStructureComponent, ProductKind } from '../types'

export const productsMenu: ITSStructureComponent = (S, context, ctx) => {
  const apiVersion = ctx.config.apiVersion
  const t = ctx.t.default

  const productKindIcons: Record<ProductKind, ComponentType> = {
    wine: WineIcon,
    digital: DownloadSimpleIcon,
    bundle: StackIcon,
    physical: KindPackageIcon,
  }

  return S.listItem()
    .title(t('products'))
    .icon(PackageIcon)
    .child(
      S.list()
        .title('Select a Kind')
        .items(
          ctx.config.productKinds.map((kind) =>
            S.listItem()
              .title(kind.toUpperCase())
              .icon(productKindIcons[kind])
              // PANE 2: Show Products of this Kind
              .child(
                S.documentTypeList('product')
                  .title(`${kind} Products`)
                  .apiVersion(apiVersion)
                  .filter('_type == "product" && kind == $kind')
                  .params({ kind })
                  // PANE 3: The Magic "Split" View
                  .child((productId) =>
                    S.list()
                      .id('ProductOptions')
                      .title('Product Options')
                      .items([
                        // Option 1: Edit the Product Details
                        S.listItem()
                          .title('Edit Product Info')
                          .child(S.document().schemaType('product').documentId(productId)),
                        // Option 2: View/Edit the 1,000 Variants
                        S.listItem().title('Manage Variants').icon(SlidersHorizontalIcon).child(
                          S.documentTypeList('productVariant')
                            .title('Variants')
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
