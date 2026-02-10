import { CoreBackConfig, ITSFeatureRegistry, ITSFeatureKey, ITSDocumentDefinition, ITSSchemaDefinition } from '../types'

import { getCoreObjects } from '../schemas/objects'
import { getCoreDocuments } from '../schemas/documents'

export const createFeatureRegistry = (config: CoreBackConfig): ITSFeatureRegistry => {
  const docs = getCoreDocuments(config.documents);
  const allDocs: ITSDocumentDefinition[] = docs.filter(doc => doc.type === 'document');
  const objects = getCoreObjects(config.objects);
  const schemas = [...allDocs, ...objects];
  // const allObjs: ITSObjectDefinition[] = objects.filter(obj => obj.type === 'object');

  const isFeatureEnabled = (feature: ITSFeatureKey) => {
    const { features } = config;

    // Logic to handle nested keys like 'shop.manufacturer'
    if (feature === 'shop') return !!features.shop.enabled;
    if (feature === 'shop.manufacturer') return !!features.shop.enabled && !!features.shop.manufacturer;
    if (feature === 'shop.category') return !!features.shop.enabled && !!features.shop.category;
    if (feature === 'shop.vinofact') return !!features.shop.vinofact.enabled;
    if (feature === 'blog') return !!features.blog;
    if (feature === 'users') return !!features.users;

    return false;
  }

  const featureFilter = (definition: ITSSchemaDefinition) => {
    if (!definition.feature) return true;
    return isFeatureEnabled(definition.feature);
  }
  // const featureFilter = (definition: ITSSchemaDefinition) => {
  //   if (!definition.feature) return true;
  //   if (definition.feature === 'shop') return !!config.features.shop.enabled;
  //   if (definition.feature === 'shop.manufacturer') 
  //       return !!config.features.shop.enabled && !!config.features.shop.manufacturer;
  //   return true;
  // }

  const enabledDocs = allDocs.filter(featureFilter)
  const enabledDocNames = enabledDocs.map(d => d.name);

  const enabledObjects = objects.filter(featureFilter)
  const enabledObjectNames = enabledObjects.map(o => o.name);

  const enabledSchemaNames = [...enabledDocNames, ...enabledObjectNames];

  return {
    isFeatureEnabled,
    // isFeatureEnabled: (feature: ITSFeatureKey) => {
    //   const { features } = config;
  
    //   // Logic to handle nested keys like 'shop.manufacturer'
    //   if (feature === 'shop') return !!features.shop.enabled;
    //   if (feature === 'shop.manufacturer') return !!features.shop.enabled && !!features.shop.manufacturer;
    //   if (feature === 'shop.category') return !!features.shop.enabled && !!features.shop.category;
    //   if (feature === 'shop.vinofact') return !!features.shop.vinofact.enabled;
    //   if (feature === 'blog') return !!features.blog;
    //   if (feature === 'users') return !!features.users;

    //   return false;
    // },

    // allDocs: docs,
    allSchemas: schemas,
    getSchema: (name: string) => schemas.find(d => d.name === name),
    isSchemaEnabled: (name: string) => enabledSchemaNames.includes(name),
    getDoc: (name: string) => allDocs.find(d => d.name === name),
    isDocEnabled: (name: string) => enabledDocNames.includes(name),
    getEnabledDocs: () => enabledDocs,
    
    getEnabledObjects: () => enabledObjects
  };
};