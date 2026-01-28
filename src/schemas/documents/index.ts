import { SchemaTypeDefinition } from 'sanity';
import { CoreDocument, ITSContext, FieldContext } from '../../types';
import { createFieldFactory, shapeSchema } from "../../utils";

export const createDocumentSchema = (
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
    title: ctx.helpers.t.default(`${documentName}.title`),
    type: 'document',
    icon: extension?.icon ?? documentDefinition.icon,
    groups,
    fieldsets,
    fields,
    preview
  } as SchemaTypeDefinition;
};