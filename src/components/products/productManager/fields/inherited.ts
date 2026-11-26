import type { ITSFormatter, ITSTranslator } from '../../../../types/localization'
import { TaxCategory } from '../ProductCreator.types'

/** "14,90 € vom Produkt" — the placeholder of an empty row price (nothing when no price). */
export function inheritedPriceLabel(
  componentT: ITSTranslator,
  format: Pick<ITSFormatter, 'currency'>,
  productPrice: number | undefined,
): string | undefined {
  if (!productPrice) return undefined
  return componentT.default('productCreatorTool.inherited.price', undefined, {
    price: format.currency(productPrice / 100),
  })
}

function taxTitle(taxCategories: TaxCategory[], id: string | undefined): string | undefined {
  const tc = id ? taxCategories.find((t) => t._id === id) : undefined
  return tc ? `${tc.title} (${tc.code})` : undefined
}

/**
 * The empty option of a row's tax select: what the variant inherits — the product's tax category,
 * else the shop default (`shopSettings.defaultTaxCategory`, applied at checkout).
 */
export function inheritedTaxLabel(
  componentT: ITSTranslator,
  taxCategories: TaxCategory[],
  productTaxCategoryId: string | undefined,
  shopDefaultTaxCategoryId: string | undefined,
): string {
  const product = taxTitle(taxCategories, productTaxCategoryId)
  if (product) {
    return componentT.default('productCreatorTool.inherited.taxProduct', undefined, {
      title: product,
    })
  }
  const shop = taxTitle(taxCategories, shopDefaultTaxCategoryId)
  return shop
    ? componentT.default('productCreatorTool.inherited.taxShopDefault', undefined, { title: shop })
    : componentT.default('productCreatorTool.inherited.taxNone')
}
