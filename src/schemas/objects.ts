import { ITSSchemaDefinition } from '../types';

import { seo } from './objects/seo';
import { baseImage } from './objects/baseImage';
import { localeTextsImage } from './objects/localeTextsImage';

// import { customImage } from './objects/customImage';
import { cropImage } from './objects/cropImage';
import { localeImage } from './objects/localeImage';
// import { titleImage } from './objects/titleImage';
// import { complexPortableText } from './objects/complexPortableText';
// import { multiColumns } from './objects/multiColumns';
import { productBundleItem } from './objects/productBundleItem';
import { youtube } from './objects/youtube';
// import { localeComplexPortable } from './objects/localeComplexPortable';
import { carousel } from './objects/carousel';
// import { shipping } from './objects/shipping';
// import { shippingRate } from './objects/shippingRate';
// import { taxCountrySettings } from './objects/taxCountrySettings';
import { shippingRate } from './objects/shippingRate';
import { taxRule } from './objects/taxRule';
import { address } from './objects/address';
import { addressStrict } from './objects/addressStrict';
import { internalLink } from './objects/internalLink';
import { menuItem } from './objects/menuItem';
import { orderItem } from './objects/orders/orderItem';
import { orderTotals } from './objects/orders/orderTotals';
import { orderStatusHistory } from './objects/orders/orderStatusHistory';
import { orderCustomer } from './objects/orders/orderCustomer';

import { hero } from './modules/hero';
import { portableText } from './modules/portableText';
import { textBlock } from './objects/textBlock';
import { bankAccount } from './objects/bankAccount';
import { company } from './objects/company';
import { vatBreakdownItem } from './objects/orders/vatBreakdownItem';
import { fulfillment } from './objects/orders/fulfillment';

export const getCoreObjects = (extensions: ITSSchemaDefinition[] | undefined): ITSSchemaDefinition[] => {
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

    ...extensions ? extensions : [],
  ]
}