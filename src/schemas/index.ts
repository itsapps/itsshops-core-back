import { SchemaTypeDefinition } from 'sanity';
import { ITSObjectDefinition, ITSImageDefinition, ITSArrayDefinition, ITSSchemaDefinition, ITSDocumentDefinition, ITSContext, FieldContext } from '../types'
import { createFieldFactory, shapeSchema } from "../utils";
import { createBuilders } from './builders';

export function buildSchemas(ctx: ITSContext): SchemaTypeDefinition[] {
  const objectBuilders = ctx.featureRegistry.getEnabledObjects();
  const documentBuilders = ctx.featureRegistry.getEnabledDocs();

  return [...objectBuilders, ...documentBuilders].map(b => createDefinition(ctx, b));
}

export function createDefinition(ctx: ITSContext, definition: ITSSchemaDefinition): SchemaTypeDefinition {
  const extension = ctx.config.schemaExtensions?.[definition.name];
  const name = definition.name

  const f = createFieldFactory(name, ctx);
  const builders = createBuilders(f, ctx);
  const fieldCtx: FieldContext = { ...ctx, f, builders };
  
  const icon = extension?.icon ?? definition.icon
  const title = definition.title ?? ctx.t.default(`${name}.title`)
  const description = definition.description ?? ctx.t.strict(`${name}.description`)

  if (definition.type === 'document' || definition.type === 'object') {
    const def = definition as ITSObjectDefinition | ITSDocumentDefinition
    const built = def.build(fieldCtx);

    // const ext = extension as DocumentSchemaExtension | ObjectSchemaExtension;
    // const groups = builtt.groups;
    // const fieldsets = builtt.fieldsets;

    const { fields, groups, fieldsets } = shapeSchema(
      name,
      fieldCtx,
      built.groups,
      built.fieldsets,
      built.fields,
      extension
    );

    const preview = extension?.preview ?
      extension.preview(ctx) :
      built.preview
    
    return {
      ...built,
      type: definition.type,
      description,
      name,
      title,
      ...icon && { icon },
      fields,
      ...groups && { groups },
      ...fieldsets && { fieldsets },
      preview,
    } as SchemaTypeDefinition
  }
  
  else if (definition.type === 'array') {
    const def = definition as ITSArrayDefinition
    const built = def.build(fieldCtx);
    
    return {
      ...built,
      type: definition.type,
      description,
      name,
      title,
      ...icon && { icon },
    } as SchemaTypeDefinition
  } else if (definition.type === 'image') {
    const def = definition as ITSImageDefinition
    const built = def.build(fieldCtx);

    const { fields, fieldsets } = shapeSchema(
      name,
      fieldCtx,
      [],
      built.fieldsets,
      built.fields || [],
      extension
    );
    
    const preview = extension?.preview ?
      extension.preview(ctx) :
      built.preview

    return {
      ...built,
      type: definition.type,
      description,
      name,
      title,
      ...icon && { icon },
      ...fields && { fields },
      ...fieldsets && { fieldsets },
      preview,
    } as SchemaTypeDefinition
  }
  else {
    throw new Error(`Unknown schema type for schema named "${name}"`)
  }
  
}