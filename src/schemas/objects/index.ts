import { SchemaTypeDefinition } from 'sanity';
import { seo } from './seo';
import { customImage } from './customImage';
import { cropImage } from './cropImage';
import { localeImage } from './localeImage';
import { titleImage } from './titleImage';
import { complexPortableText } from './complexPortableText';
import { multiColumns } from './multiColumns';
import { youtube } from './youtube';
import { localeComplexPortable } from './localeComplexPortable';
import { carousel } from './carousel';
// import { localeImages } from './localeImages';
import { shipping } from './shipping';
import { shippingRate } from './shippingRate';
import { address } from './address';
import { internalLink } from './internalLink';
// Import any new objects here

import { ITSContext, CoreObject } from '../../types';
import { createFieldFactory } from '../../utils/fields';

export const getCoreObjects = (
  ctx: ITSContext,
): SchemaTypeDefinition[] => {
  // Define the list of object builders
  const builders: CoreObject[] = [
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
  ];
  if (ctx.config.features.shop) {
    builders.push(shipping)
    builders.push(shippingRate)
    builders.push(address)
  }

  ctx.config.objects && builders.push(...ctx.config.objects)

  return builders.map((b) => {
    const f = createFieldFactory(b.name, ctx);
    const built = b.build({ ...ctx, f });

    const finalType = built.type || b.type || 'object';

    // if (b.type === 'object' && !built.fields) {
    //   built.fields = [];
    // }
    const fieldsAdjustment = (finalType === 'object' && !built.fields) 
      ? { fields: [] } 
      : {};

    const obj = {
      name: b.name,
      type: finalType,
      title: ctx.helpers.t.default(`${b.name}.title`),
      ...built,
      ...fieldsAdjustment,
    } as SchemaTypeDefinition

    return obj
  });
};