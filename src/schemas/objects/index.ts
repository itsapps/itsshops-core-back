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
// Import any new objects here

import { SchemaContext, CoreObject } from '../../types';
import { createFieldFactory } from '../../utils/fields';

export const getCoreObjects = (
  ctx: SchemaContext,
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
  ];
  if (ctx.config.features.shop) {
    builders.push(shipping)
  }

  return builders.map((d) => {
    const f = createFieldFactory(d.name, ctx);
    const built = d.build({ ...ctx, f });

    if (d.type === 'object' && !built.fields) {
      built.fields = [];
    }

    const obj = {
      name: d.name,
      type: d.type || 'object',
      title: ctx.t(`${d.name}.title`),
      ...built,
    } as SchemaTypeDefinition

    return obj
  });
};