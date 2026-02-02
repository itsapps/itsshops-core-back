import { CoreBackConfig, ITSFeatureRegistry, ITSFeatureKey, ITSDocumentDefinition } from '../types'

import { getCoreObjects } from '../schemas/objects'
import { getCoreDocuments } from '../schemas/documents'

export const createFeatureRegistry = (config: CoreBackConfig): ITSFeatureRegistry => {
  const docs = getCoreDocuments(config.documents) as ITSDocumentDefinition[];

  const enabledDocs = docs
    .filter(doc => {
      if (doc.type !== 'document') return false;
      if (!doc.feature) return true;
      if (doc.feature === 'shop') return !!config.features.shop.enabled;
      if (doc.feature === 'shop.manufacturer') 
          return !!config.features.shop.enabled && !!config.features.shop.manufacturer;
      return true;
    })
  const enabledDocNames = enabledDocs.map(d => d.name);

  const objects = getCoreObjects(config.objects);
  const enabledObjects = objects
    .filter(object => {
       if (!object.feature) return true;
       if (object.feature === 'shop') return !!config.features.shop.enabled;
       if (object.feature === 'shop.manufacturer') 
           return !!config.features.shop.enabled && !!config.features.shop.manufacturer;
       return true;
    })
  const enabledObjectNames = enabledObjects.map(o => o.name);

  return {
    isFeatureEnabled: (feature: ITSFeatureKey) => {
      const { features } = config;
  
      // Logic to handle nested keys like 'shop.manufacturer'
      if (feature === 'shop') return !!features.shop.enabled;
      if (feature === 'shop.manufacturer') return !!features.shop.enabled && !!features.shop.manufacturer;
      if (feature === 'blog') return !!features.blog;
      if (feature === 'users') return !!features.users;

      return false;
    },

    allDocs: docs,
    getDoc: (name: string) => docs.find(d => d.name === name),
    isDocEnabled: (name: string) => enabledDocNames.includes(name),
    getEnabledDocs: () => enabledDocs,
    
    allObjects: objects,
    getObject: (name: string) => objects.find(o => o.name === name),
    isObjectEnabled: (name: string) => enabledObjectNames.includes(name),
    getEnabledObjects: () => enabledObjects
  };
};