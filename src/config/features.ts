import { getCoreDocuments } from '../schemas/documents'
import { getCoreObjects } from '../schemas/objects'
import { CoreBackConfig, ITSFeatureKey, ITSFeatureRegistry, ITSSchemaDefinition } from '../types'

export const createFeatureRegistry = (config: CoreBackConfig): ITSFeatureRegistry => {
  const docs = getCoreDocuments(config.documents)
  // const allDocs: ITSDocumentDefinition[] = docs.filter(doc => doc.type === 'document');
  const objects = getCoreObjects(config.objects)
  const schemas = [...docs, ...objects]
  // const allObjs: ITSObjectDefinition[] = objects.filter(obj => obj.type === 'object');

  const shopEnabled = !!config.features.shop?.enabled
  const featureMap: Record<ITSFeatureKey, boolean> = {
    shop: shopEnabled,
    'shop.manufacturer': shopEnabled && !!config.features.shop?.manufacturer,
    'shop.stock': shopEnabled && !!config.features.shop?.stock,
    'shop.category': shopEnabled && !!config.features.shop?.category,
    'shop.vinofact': shopEnabled && !!config.features.shop?.vinofact?.enabled,
    'shop.productKind.wine': shopEnabled && config.schemaSettings.productKinds.includes('wine'),
    'shop.productKind.physical':
      shopEnabled && config.schemaSettings.productKinds.includes('physical'),
    'shop.productKind.digital':
      shopEnabled && config.schemaSettings.productKinds.includes('digital'),
    'shop.productKind.bundle': shopEnabled && config.schemaSettings.productKinds.includes('bundle'),
    'shop.productKind.options':
      shopEnabled &&
      (config.schemaSettings.productKinds.includes('physical') ||
        config.schemaSettings.productKinds.includes('digital')),
    blog: !!config.features.blog,
    users: !!config.features.users,
  }

  const isFeatureEnabled = (feature: ITSFeatureKey): boolean => featureMap[feature] ?? false

  const featureFilter = (definition: ITSSchemaDefinition) => {
    if (!definition.feature) return true
    return isFeatureEnabled(definition.feature)
  }

  const enabledDocs = docs.filter(featureFilter)
  const enabledDocNames = enabledDocs.map((d) => d.name)

  const enabledObjects = objects.filter(featureFilter)
  const enabledObjectNames = enabledObjects.map((o) => o.name)

  const enabledSchemaNames = [...enabledDocNames, ...enabledObjectNames]

  return {
    isFeatureEnabled,
    allSchemas: schemas,
    getSchema: (name: string) => schemas.find((d) => d.name === name),
    isSchemaEnabled: (name: string) => enabledSchemaNames.includes(name),
    getDoc: (name: string) => docs.find((d) => d.name === name),
    isDocEnabled: (name: string) => enabledDocNames.includes(name),
    getEnabledDocs: () => enabledDocs,
    getEnabledObjects: () => enabledObjects,
  }
}
