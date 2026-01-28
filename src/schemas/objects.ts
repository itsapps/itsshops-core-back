import { CoreObject } from '../types';

import { seo } from './objects/seo';
import { customImage } from './objects/customImage';
import { cropImage } from './objects/cropImage';
import { localeImage } from './objects/localeImage';
import { titleImage } from './objects/titleImage';
import { complexPortableText } from './objects/complexPortableText';
import { multiColumns } from './objects/multiColumns';
import { youtube } from './objects/youtube';
import { localeComplexPortable } from './objects/localeComplexPortable';
import { carousel } from './objects/carousel';
import { shipping } from './objects/shipping';
import { shippingRate } from './objects/shippingRate';
import { address } from './objects/address';
import { internalLink } from './objects/internalLink';

export const getCoreObjects = (extensions: CoreObject[] | undefined): CoreObject[] => {
  return [
    seo,
    customImage,
    localeImage,
    titleImage,
    // localeImages,
    cropImage,
    complexPortableText,
    localeComplexPortable,
    multiColumns,
    youtube,
    carousel,
    internalLink,
    shipping,
    shippingRate,
    address,
    ...extensions ? extensions : [],
  ]
}