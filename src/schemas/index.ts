import { SchemaContext } from '../types'
// import {createSchema} from './schemaBuilder'
import {createProductSchema} from './documents/product'
import {createProductVariantSchema} from './documents/productVariant'
import { getCoreObjects } from './objects'


export default function (ctx: SchemaContext) {
  // const baseSchemas = [product]
  // return baseSchemas.map(schema => {
  //   return createSchema(schema, props.translator)
  // })
  const objects = getCoreObjects(ctx);
  const documents = []

  if (ctx.config.features.shop) {
    documents.push(createProductSchema(ctx))
    documents.push(createProductVariantSchema(ctx))
  }

  return [
    ...objects,
    ...documents
  ]
}
