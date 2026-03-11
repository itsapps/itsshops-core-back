import { Transaction } from '@sanity/client'

import {
  BundleVariantRow,
  CombinationRow,
  I18nTitleEntry,
  WineRow,
} from '../../components/products/productManager/ProductCreator.types'
import { ProductKind } from '../../types'
import { docUid, uid } from '../../utils/utils'

/** Cartesian product of arrays */
export function cartesian<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]]
  return arrays.reduce<T[][]>(
    (acc, arr) => acc.flatMap((combo) => arr.map((item) => [...combo, item])),
    [[]],
  )
}

export function buildI18nTitle(entries: I18nTitleEntry[]): { _key: string; value: string }[] {
  return entries
    .filter((e) => e.value.trim())
    .map((e) => ({ _key: e.locale, value: e.value.trim() }))
}

type ProductTxProps = {
  tx: Transaction
  kind: ProductKind
  titles: I18nTitleEntry[]
  price: number | undefined
  weight: number | undefined
  taxId?: string
}
export function addProductToTx(props: ProductTxProps): string {
  const { tx, kind, titles, price, taxId, weight } = props
  const productId = docUid('product')

  tx.create({
    _id: productId,
    _type: 'product',
    title: buildI18nTitle(titles),
    kind,
    ...(price !== undefined && { price }),
    ...(taxId && { taxCategory: { _type: 'reference', _ref: taxId } }),
    ...(weight !== undefined && { weight }),
  })

  return productId
}

function baseVariant(
  productId: string,
  kind: ProductKind,
  titles: I18nTitleEntry[],
  price: number | undefined,
  taxId?: string,
) {
  const rowTitles = buildI18nTitle(titles)
  return {
    _id: docUid('productVariant'),
    _type: 'productVariant',
    kind,
    product: { _type: 'reference', _ref: productId },
    status: 'active',
    featured: false,
    ...(rowTitles.length && { title: rowTitles }),
    ...(price !== undefined && { price }),
    ...(taxId && { taxCategory: { _type: 'reference', _ref: taxId } }),
  }
}
export function addWineVariantToTx(tx: Transaction, productId: string, row: WineRow): void {
  if (!row.wine || !row.volume) return

  tx.create({
    ...baseVariant(productId, 'wine', row.titles, row.price, row.taxCategoryId),
    wine: {
      _type: 'wine',
      vinofactWineId: row.wine.id,
      ...(row.wine.year && { vintage: row.wine.year }),
      volume: parseInt(row.volume, 10),
    },
  })
}

export function addPhysicalDigitalVariantToTx(
  tx: Transaction,
  productId: string,
  kind: 'physical' | 'digital',
  combo: CombinationRow,
): void {
  if (!combo.enabled) return

  tx.create({
    ...baseVariant(productId, kind, combo.titles, combo.price, combo.taxCategoryId),
    options: combo.optionIds.map((optId) => ({
      _key: uid(),
      _type: 'reference',
      _ref: optId,
    })),
    ...(combo.weight !== undefined && { weight: combo.weight }),
  })
}

export function addBundleVariantToTx(
  tx: Transaction,
  productId: string,
  row: BundleVariantRow,
): void {
  tx.create({
    ...baseVariant(productId, 'bundle', row.titles, row.price, row.taxCategoryId),
    bundleItems: row.items.map((item) => ({
      _type: 'bundleItem',
      _key: uid(),
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      product: { _type: 'reference', _ref: item.variantId },
    })),
  })
}
