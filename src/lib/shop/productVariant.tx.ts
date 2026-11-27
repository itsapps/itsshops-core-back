import { Transaction } from '@sanity/client'

import {
  BundleVariantRow,
  CombinationRow,
  I18nTitleEntry,
  NewVariantStatus,
  WineRow,
} from '../../components/products/productManager/ProductCreator.types'
import { ProductKind } from '../../types'
import { parseStock } from '../../utils/productManager'
import { docUid, uid } from '../../utils/utils'

/** Cartesian product of arrays */
export function cartesian<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]]
  return arrays.reduce<T[][]>(
    (acc, arr) => acc.flatMap((combo) => arr.map((item) => [...combo, item])),
    [[]],
  )
}

export function buildI18nTitle(
  entries: I18nTitleEntry[],
): { _type: string; _key: string; language: string; value: string }[] {
  return entries
    .filter((e) => e.value.trim())
    .map((e) => ({
      _type: 'internationalizedArrayStringValue',
      _key: uid(),
      language: e.locale,
      value: e.value.trim(),
    }))
}

type ProductTxProps = {
  tx: Transaction
  kind: ProductKind
  titles: I18nTitleEntry[]
  price: number | undefined
  weight: number | undefined
  taxId?: string
  categoryIds?: string[]
  manufacturerIds?: string[]
}

function references(ids: string[] | undefined) {
  return (ids ?? []).map((_ref) => ({ _type: 'reference', _key: uid(), _ref }))
}

export function addProductToTx(props: ProductTxProps): string {
  const { tx, kind, titles, price, taxId, weight, categoryIds, manufacturerIds } = props
  const productId = docUid('product')

  tx.create({
    _id: productId,
    _type: 'product',
    title: buildI18nTitle(titles),
    kind,
    ...(price !== undefined && { price }),
    ...(taxId && { taxCategory: { _type: 'reference', _ref: taxId } }),
    ...(weight !== undefined && { weight }),
    ...(categoryIds?.length && { categories: references(categoryIds) }),
    ...(manufacturerIds?.length && { manufacturers: references(manufacturerIds) }),
  })

  return productId
}

type BaseVariantOptions = {
  titles: I18nTitleEntry[]
  price: number | undefined
  taxId?: string
  status?: NewVariantStatus
  sku?: string
  /** As typed; written only when a valid whole number ≥ 0 (empty = unlimited). */
  stock?: string
}

function baseVariant(productId: string, kind: ProductKind, options: BaseVariantOptions) {
  const { titles, price, taxId, status = 'active', sku, stock } = options
  const rowTitles = buildI18nTitle(titles)
  const stockValue = stock === undefined ? undefined : parseStock(stock).value
  return {
    _id: docUid('productVariant'),
    _type: 'productVariant',
    kind,
    product: { _type: 'reference', _ref: productId },
    status,
    ...(rowTitles.length && { title: rowTitles }),
    ...(price !== undefined && { price }),
    ...(taxId && { taxCategory: { _type: 'reference', _ref: taxId } }),
    ...(sku?.trim() && { sku: sku.trim() }),
    ...(stockValue !== undefined && { stock: stockValue }),
  }
}
/** Returns the created variant's id (published), or `undefined` when the row is incomplete. */
export function addWineVariantToTx(
  tx: Transaction,
  productId: string,
  row: WineRow,
): string | undefined {
  if (!row.wine || !row.volume) return undefined

  const variant = baseVariant(productId, 'wine', {
    titles: row.titles,
    price: row.price,
    taxId: row.taxCategoryId,
    status: row.status,
    sku: row.sku,
    stock: row.stock,
  })
  tx.create({
    ...variant,
    wine: {
      _type: 'wine',
      vinofactWineId: row.wine.id,
      ...(row.wine.year && { vintage: row.wine.year }),
      volume: parseInt(row.volume, 10),
    },
  })
  return variant._id
}

export function addPhysicalDigitalVariantToTx(
  tx: Transaction,
  productId: string,
  kind: 'physical' | 'digital',
  combo: CombinationRow,
): void {
  if (!combo.enabled) return

  tx.create({
    ...baseVariant(productId, kind, {
      titles: combo.titles,
      price: combo.price,
      taxId: combo.taxCategoryId,
      status: combo.status,
      sku: combo.sku,
      stock: combo.stock,
    }),
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
    // no tax category: a bundle is taxed by its items (checkout splits its price over them)
    ...baseVariant(productId, 'bundle', {
      titles: row.titles,
      price: row.price,
      status: row.status,
      sku: row.sku,
    }),
    bundleItems: row.items.map((item) => ({
      _type: 'bundleItem',
      _key: uid(),
      // Last guard only: the tab refuses quantities that aren't whole numbers ≥ 1
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      product: { _type: 'reference', _ref: item.variantId },
    })),
  })
}
