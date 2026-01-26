export * from './product';
export * from './productVariant';

import { SchemaTypeDefinition } from 'sanity';
import { CoreDocument, SchemaContext, FieldContext } from '../../types';
import { createFieldFactory, shapeSchema } from "../../utils";

export const createDocumentSchema = (
  ctx: SchemaContext,
  documentDefinition: CoreDocument,
): SchemaTypeDefinition => {
  const documentName = documentDefinition.name;
  const f = createFieldFactory(documentName, ctx);
  const fieldCtx: FieldContext = { ...ctx, f };
  
  const baseFields = documentDefinition.baseFields(fieldCtx);
  const { fields, groups, fieldsets } = shapeSchema(
    documentName,
    baseFields,
    fieldCtx
  );

  const extension = ctx.config.schemaExtensions?.[documentName];
  const preview = extension?.preview ? extension.preview(ctx) : documentDefinition.preview(ctx);

  return {
    name: documentName,
    title: ctx.t(`${documentName}.title`),
    type: 'document',
    groups,
    fieldsets,
    fields,
    preview
  } as SchemaTypeDefinition;
};