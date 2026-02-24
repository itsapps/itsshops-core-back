import { ITSSchemaDefinition } from '../types'
import { hero } from './modules/hero'
import { portableText } from './modules/portableText'
import { address } from './objects/address'
import { addressStrict } from './objects/addressStrict'
import { bankAccount } from './objects/bankAccount'
import { baseImage } from './objects/baseImage'
import { carousel } from './objects/carousel'
import { company } from './objects/company'
import { cropImage } from './objects/cropImage'
import { internalLink } from './objects/internalLink'
import { localeImage } from './objects/localeImage'
import { localeTextsImage } from './objects/localeTextsImage'
import { menuItem } from './objects/menuItem'
import { fulfillment } from './objects/orders/fulfillment'
import { orderCustomer } from './objects/orders/orderCustomer'
import { orderItem } from './objects/orders/orderItem'
import { orderStatusHistory } from './objects/orders/orderStatusHistory'
import { orderTotals } from './objects/orders/orderTotals'
import { vatBreakdownItem } from './objects/orders/vatBreakdownItem'
import { productBundleItem } from './objects/productBundleItem'
import { seo } from './objects/seo'
import { shippingRate } from './objects/shippingRate'
import { taxRule } from './objects/taxRule'
import { textBlock } from './objects/textBlock'
import { youtube } from './objects/youtube'

export const getCoreObjects = (
  extensions: ITSSchemaDefinition[] | undefined,
): ITSSchemaDefinition[] => {
  return [
    productBundleItem,
    seo,
    // customImage,
    localeImage,
    baseImage,
    localeTextsImage,
    // titleImage,
    // // localeImages,
    cropImage,
    // complexPortableText,
    // localeComplexPortable,
    // multiColumns,
    youtube,
    menuItem,
    carousel,
    internalLink,
    // shipping,
    // shippingRate,
    // taxCountrySettings,
    taxRule,
    shippingRate,
    address,
    addressStrict,
    bankAccount,
    company,
    orderItem,
    orderTotals,
    orderStatusHistory,
    orderCustomer,
    fulfillment,
    vatBreakdownItem,

    hero,
    portableText,
    textBlock,

    ...(extensions ? extensions : []),
  ]
}