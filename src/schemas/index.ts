import { SchemaTypeDefinition } from 'sanity';
import { ITSContext, FieldContext, CoreDocument, CoreObject } from '../types'
import { createFieldFactory, shapeSchema } from "../utils";

export function buildSchemas(ctx: ITSContext): SchemaTypeDefinition[] {
  const objectBuilders = ctx.featureRegistry.getEnabledObjects();
  const objects = objectBuilders.map(b => createObjectSchema(ctx, b))

  const documentBuilders = ctx.featureRegistry.getEnabledDocs();
  const documents = documentBuilders.map(b => createDocumentSchema(ctx, b))

  return [
    ...objects,
    ...documents
  ]
}

const createDocumentSchema = (
  ctx: ITSContext,
  documentDefinition: CoreDocument,
): SchemaTypeDefinition => {
  const documentName = documentDefinition.name;
  const f = createFieldFactory(documentName, ctx);
  const fieldCtx: FieldContext = { ...ctx, f };
  const extension = ctx.config.schemaExtensions?.[documentName];

  const coreGroups = typeof documentDefinition.groups === 'function' 
    ? documentDefinition.groups(ctx) 
    : documentDefinition.groups || [];
  const coreFieldsets = typeof documentDefinition.fieldsets === 'function' 
    ? documentDefinition.fieldsets(ctx) 
    : documentDefinition.fieldsets || [];

  const { fields, groups, fieldsets } = shapeSchema(
    documentName,
    fieldCtx,
    coreGroups,
    coreFieldsets,
    documentDefinition.baseFields(fieldCtx),
    extension
  );

  const preview = extension?.preview ?
    extension.preview(ctx) :
    documentDefinition.preview ? documentDefinition.preview(ctx) : undefined
  
  return {
    name: documentName,
    title: ctx.t.default(`${documentName}.title`),
    type: 'document',
    icon: extension?.icon ?? documentDefinition.icon,
    groups,
    fieldsets,
    fields,
    preview
  } as SchemaTypeDefinition;
};

const createObjectSchema = (
  ctx: ITSContext,
  objectDefinition: CoreObject,
): SchemaTypeDefinition => {
  const f = createFieldFactory(objectDefinition.name, ctx);
  
  const built = objectDefinition.build({ ...ctx, f });
  const finalType = built.type || objectDefinition.type || 'object';
  const fieldsAdjustment = (finalType === 'object' && !built.fields) // TODO: check this
    ? { fields: [] } 
    : {};

  const obj = {
    name: objectDefinition.name,
    type: finalType,
    title: ctx.t.default(`${objectDefinition.name}.title`),
    ...built,
    ...fieldsAdjustment,
  } as SchemaTypeDefinition

  return obj
}