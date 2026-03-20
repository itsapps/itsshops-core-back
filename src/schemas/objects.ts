import { ITSSchemaDefinition } from '../types'
import { categoryGrid } from './modules/categoryGrid'
import { productGrid } from './modules/productGrid'
import { address } from './objects/address'
import { addressStrict } from './objects/addressStrict'
import { bankAccount } from './objects/bankAccount'
import { businessAddress } from './objects/businessAddress'
import { baseImage } from './objects/baseImage'
import { bundleItem } from './objects/bundleItem'
import { carousel } from './objects/carousel'
import { company } from './objects/company'
import { cropImage } from './objects/cropImage'
import { internalLink } from './objects/internalLink'
import { localeAltImage } from './objects/localeAltImage'
import { localeImage } from './objects/localeImage'
import { menuItem } from './objects/menuItem'
import { fulfillment } from './objects/orders/fulfillment'
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
import { taxRule } from './objects/taxRule'
import { wine } from './objects/wine'
import { youtube } from './objects/youtube'

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
    categoryGrid,
    productGrid,
    internalLink,
    company,
    cropImage,
    fulfillment,
    localeAltImage,
    localeImage,
    menuItem,
    orderCustomer,
    orderItem,
    orderItemBundle,
    orderItemOption,
    orderItemWine,
    orderStatusHistory,
    orderTotals,
    seo,
    shippingRate,
    taxRule,
    vatBreakdownItem,
    wine,
    youtube,
    ...(extensions ? extensions : []),
  ]
}