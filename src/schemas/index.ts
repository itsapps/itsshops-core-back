import { SchemaTypeDefinition } from 'sanity';
import { ITSContext, CoreBackConfig, CoreDocument, ITSFeatureRegistry, ITSFeatureKey } from '../types'

import { blog } from './documents/blog'
import { category } from './documents/category'
import { customerGroup } from './documents/customerGroup'
import { manufacturer } from './documents/manufacturer'
import { menu } from './documents/menu'
import { order } from './documents/order'
import { orderMeta } from './documents/orderMeta'
import { page } from './documents/page';
import { post } from './documents/post';
import { product } from './documents/product'
import { productVariant } from './documents/productVariant'
import { settings } from './documents/settings';
import { shippingCountry } from './documents/shippingCountry'
import { user } from './documents/user'
import { variantOption } from './documents/variantOption'
import { variantOptionGroup } from './documents/variantOptionGroup'
import { voucher } from './documents/voucher';

import { createDocumentSchema } from './documents'
import { getCoreObjects } from './objects'

export const createFeatureRegistry = (config: CoreBackConfig): ITSFeatureRegistry => {
  const docs = [
    blog, category, customerGroup, manufacturer, menu, order, orderMeta, page, post, product, productVariant,
    settings, shippingCountry, user, variantOption, variantOptionGroup, voucher,
    ...config.documents ? config.documents : [],
  ]

  const enabledDocs = docs
    .filter(doc => {
       if (!doc.feature) return true;
       if (doc.feature === 'shop') return !!config.features.shop.enabled;
       if (doc.feature === 'shop.manufacturer') 
           return !!config.features.shop.enabled && !!config.features.shop.manufacturer;
       return true;
    })
  const enabledDocNames = enabledDocs.map(d => d.name);

  return {
    all: docs,
    get: (name: string) => docs.find(d => d.name === name),
    isFeatureEnabled: (feature: ITSFeatureKey) => {
      const { features } = config;
  
      // Logic to handle nested keys like 'shop.manufacturer'
      if (feature === 'shop') return !!features.shop.enabled;
      if (feature === 'shop.manufacturer') return !!features.shop.enabled && !!features.shop.manufacturer;
      if (feature === 'blog') return !!features.blog;
      if (feature === 'users') return !!features.users;

      return false;
    },
    isEnabled: (name: string) => enabledDocNames.includes(name),
    getEnabled: () => enabledDocs,
    // Helper to see if a specific document type should exist right now
    
  };
};

export function buildSchemas(documentBuilders: CoreDocument[], ctx: ITSContext): SchemaTypeDefinition[] {
  const objects = getCoreObjects(ctx);
  const documents = documentBuilders.map(b => createDocumentSchema(ctx, b))

  return [
    ...objects,
    ...documents
  ]
}