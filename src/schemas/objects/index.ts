// packages/core-back/src/schemas/objects/index.ts
import { seo } from './seo';
import { localeImage } from './localeImage';
import { shipping } from './shipping';
// Import any new objects here

import { SchemaContext } from '../../types';
import { createFieldFactory } from '../../utils/fields';

export const getCoreObjects = (ctx: SchemaContext) => {
  // Define the list of object builders
  const objectBuilders = [
    seo,
    localeImage,
    shipping,
    // Add new builders to this list
  ];

  return objectBuilders.map((builder) => {
    // We get the name from the builder's execution to create a specific factory
    // This solves your 'docName' problem automatically
    const tempObj = builder(ctx, (name: string) => name); 
    const namespace = tempObj.name;
    
    const f = createFieldFactory(namespace, ctx);
    return builder(ctx, f);
  });
};