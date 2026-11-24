import { ITSDocumentDefinition, ITSFeatureKey, ITSSchemaDefinition } from './schema'

export type ITSFeatureRegistry = {
  isFeatureEnabled: (name: ITSFeatureKey) => boolean
  allSchemas: ITSSchemaDefinition[]
  getSchema: (name: string) => ITSSchemaDefinition | undefined
  isSchemaEnabled: (name: string) => boolean
  getDoc: (name: string) => ITSDocumentDefinition | undefined
  getEnabledDocs: () => ITSDocumentDefinition[]
  isDocEnabled: (name: string) => boolean
  // allObjects: ITSSchemaDefinition[];
  // getObject: (name: string) => ITSSchemaDefinition | undefined;
  // isObjectEnabled: (name: string) => boolean;
  getEnabledObjects: () => ITSSchemaDefinition[]
}
