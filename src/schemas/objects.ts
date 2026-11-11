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
import { menuItemTypes } from './objects/menuItem'
import { productSpecification } from './objects/productSpecification'
import { appliedCoupon } from './objects/orders/appliedCoupon'
import { fulfillment } from './objects/orders/fulfillment'
import { fulfillmentPackagingLine } from './objects/orders/fulfillmentPackagingLine'
import { orderCustomer } from './objects/orders/orderCustomer'
import { orderItem } from './objects/orders/orderItem'
import { orderItemBundle } from './objects/orders/orderItemBundle'
import { orderItemBundleItem } from './objects/orders/orderItemBundleItem'
import { orderItemOption } from './objects/orders/orderItemOption'
import { orderItemWine } from './objects/orders/orderItemWine'
import { orderRefund } from './objects/orders/orderRefund'
import { orderStatusHistory } from './objects/orders/orderStatusHistory'
import { orderTotals } from './objects/orders/orderTotals'
import { orderPaymentMethod } from './objects/orders/orderPaymentMethod'
import { vatBreakdownItem } from './objects/orders/vatBreakdownItem'
import { generatedZip } from './objects/generatedZip'
import { seo } from './objects/seo'
import { shippingRate } from './objects/shippingRate'
import { packagingGroup } from './objects/packagingGroup'
import { packagingGroupBottle } from './objects/packagingGroupBottle'
import { packagingGroupPackage } from './objects/packagingGroupPackage'
import { taxRule } from './objects/taxRule'
import { wine } from './objects/wine'
import { carousel } from './modules/carousel'
import { categoryList } from './modules/categoryList'
import { productVariantList } from './modules/productVariantList'
import { productList } from './modules/productList'
import { youtube } from './modules/youtube'
import { withdrawalPolicyModule } from './modules/withdrawalPolicyModule'
import { shippingInfoModule } from './modules/shippingInfoModule'
import { privacyPolicyModule } from './modules/privacyPolicyModule'
import { privacyPolicySection } from './objects/privacyPolicySection'

export const getCoreObjects = (
  extensions: ITSSchemaDefinition[] | undefined,
  /** menu levels, top level included (`menuLevels(schemaSettings.menus)`) */
  menuLevels = 1,
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
    generatedZip,
    localeAltImage,
    localeImage,
    ...menuItemTypes(menuLevels),
    productSpecification,
    appliedCoupon,
    orderCustomer,
    orderItem,
    orderItemBundle,
    orderItemBundleItem,
    orderItemOption,
    orderItemWine,
    orderStatusHistory,
    orderRefund,
    orderPaymentMethod,
    orderTotals,
    seo,
    shippingRate,
    packagingGroup,
    packagingGroupBottle,
    packagingGroupPackage,
    taxRule,
    vatBreakdownItem,
    wine,
    withdrawalPolicyModule,
    shippingInfoModule,
    privacyPolicyModule,
    privacyPolicySection,
    youtube,
    ...(extensions ? extensions : []),
  ]
}
