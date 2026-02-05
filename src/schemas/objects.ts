import { ITSSchemaDefinition } from '../types';

import { seo } from './objects/seo';
import { baseImage } from './objects/baseImage';
import { localeTextsImage } from './objects/localeTextsImage';

// import { customImage } from './objects/customImage';
// import { cropImage } from './objects/cropImage';
// import { localeImage } from './objects/localeImage';
// import { titleImage } from './objects/titleImage';
// import { complexPortableText } from './objects/complexPortableText';
// import { multiColumns } from './objects/multiColumns';
import { youtube } from './objects/youtube';
// import { localeComplexPortable } from './objects/localeComplexPortable';
import { carousel } from './objects/carousel';
import { shipping } from './objects/shipping';
import { shippingRate } from './objects/shippingRate';
import { address } from './objects/address';
import { internalLink } from './objects/internalLink';
import { menuItem } from './objects/menuItem';
import { imageArray } from './objects/imageArray';

import { hero } from './modules/hero';
import { portableText } from './modules/portableText';
import { textBlock } from './objects/textBlock';

export const getCoreObjects = (extensions: ITSSchemaDefinition[] | undefined): ITSSchemaDefinition[] => {
  return [
    seo,
    // customImage,
    // localeImage,
    baseImage,
    localeTextsImage,
    // titleImage,
    // // localeImages,
    // cropImage,
    // complexPortableText,
    // localeComplexPortable,
    // multiColumns,
    youtube,
    menuItem,
    carousel,
    internalLink,
    shipping,
    shippingRate,
    address,
    imageArray,

    hero,
    portableText,
    textBlock,

    ...extensions ? extensions : [],
  ]
}