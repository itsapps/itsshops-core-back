import { ITSSchemaDefinition } from '../types'
import { address } from './objects/address'
import { addressStrict } from './objects/addressStrict'
import { bankAccount } from './objects/bankAccount'
import { businessAddress } from './objects/businessAddress'
import { baseImage } from './objects/baseImage'
import { bundleItem } from './objects/bundleItem'
import { company } from './objects/company'
import { cropImage } from './objects/cropImage'
import { internalLink } from './objects/internalLink'
import { localeAltImage } from './objects/localeAltImage'
import { localeImage } from './objects/localeImage'
import { menuItem } from './objects/menuItem'
import { appliedCoupon } from './objects/orders/appliedCoupon'
import { fulfillment } from './objects/orders/fulfillment'
import { fulfillmentPackagingLine } from './objects/orders/fulfillmentPackagingLine'
import { orderCustomer } from './objects/orders/orderCustomer'
import { orderItem } from './objects/orders/orderItem'
import { orderItemBundle } from './objects/orders/orderItemBundle'
import { orderItemOption } from './objects/orders/orderItemOption'
import { orderItemWine } from './objects/orders/orderItemWine'
import { orderStatusHistory } from './objects/orders/orderStatusHistory'
import { orderTotals } from './objects/orders/orderTotals'
import { vatBreakdownItem } from './objects/orders/vatBreakdownItem'
import { seo } from './objects/seo'
import { shippingRate } from './objects/shippingRate'
import { winePackage } from './objects/winePackage'
import { winePackagingConfig } from './objects/winePackagingConfig'
import { taxRule } from './objects/taxRule'
import { wine } from './objects/wine'
import { carousel } from './modules/carousel'
import { categoryList } from './modules/categoryList'
import { productVariantList } from './modules/productVariantList'
import { productList } from './modules/productList'
import { youtube } from './modules/youtube'

export const getCoreObjects = (
  extensions: ITSSchemaDefinition[] | undefined,
): ITSSchemaDefinition[] => {
  return [
    address,
    addressStrict,
    bankAccount,
    businessAddress,
    baseImage,
    bundleItem,
    carousel,
    categoryList,
    productVariantList,
    productList,
    internalLink,
    company,
    cropImage,
    fulfillment,
    fulfillmentPackagingLine,
    localeAltImage,
    localeImage,
    menuItem,
    appliedCoupon,
    orderCustomer,
    orderItem,
    orderItemBundle,
    orderItemOption,
    orderItemWine,
    orderStatusHistory,
    orderTotals,
    seo,
    shippingRate,
    winePackage,
    winePackagingConfig,
    taxRule,
    vatBreakdownItem,
    wine,
    youtube,
    ...(extensions ? extensions : []),
  ]
}
