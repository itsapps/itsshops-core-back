import { SchemaTypeDefinition } from 'sanity';
import { SchemaContext, CoreDocument } from '../types'
// import {createSchema} from './schemaBuilder'
import {product, productVariant} from './documents'
import { createDocumentSchema } from './documents'
import { getCoreObjects } from './objects'

export function buildSchemas(ctx: SchemaContext): SchemaTypeDefinition[] {
  const objects = getCoreObjects(ctx);
  
  const documentBuilders: CoreDocument[] = []
  if (ctx.config.features.shop) {
    documentBuilders.push(product)
    documentBuilders.push(productVariant)
  }
  const documents = documentBuilders.map(b => createDocumentSchema(ctx, b))

  return [
    ...objects,
    ...documents
  ]
}
