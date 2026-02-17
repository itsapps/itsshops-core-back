import { SchemaTypeDefinition, defineType } from 'sanity';
import { ITSSchemaDefinition, ITSContext, FieldContext } from '../types'
import { createFactory, shapeSchema } from "../utils";
import { createBuilders } from './builders';

export function buildSchemas(ctx: ITSContext): SchemaTypeDefinition[] {
  const objectBuilders = ctx.featureRegistry.getEnabledObjects();
  const documentBuilders = ctx.featureRegistry.getEnabledDocs();

  return [...objectBuilders, ...documentBuilders].map(b => createDefinition(ctx, b));
}

export function createDefinition(ctx: ITSContext, definition: ITSSchemaDefinition) {
  const extension = ctx.config.schemaExtensions?.[definition.name];
  const name = definition.name

  // const factory = createFieldFactory(name, ctx);
  const factory = createFactory(name, ctx);
  const builders = createBuilders(factory, ctx);
  const fieldCtx: FieldContext = { ...ctx, f: factory.fields, factory, builders };
  
  const icon = extension?.icon ?? definition.icon
  const title = definition.title ?? ctx.t.default(`${name}.title`)
  const description = definition.description ?? ctx.t.strict(`${name}.description`)

  const base = {
    name,
    title,
    ...description && { description },
    ...icon && { icon },
  }
  if (definition.type === 'document' || definition.type === 'object') {
    // const built = definition.build(fieldCtx);
    const built = definition.build(fieldCtx)
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

    const d = defineType({
      ...built,
      ...base,
      type: definition.type,
      fields,
      ...groups && { groups },
      ...fieldsets && { fieldsets },
      preview: preview ?? (
        definition.type === 'document' ? {
          prepare: () => ({
            title
          })
        } : undefined
      ),
    })
    return d
  }
  
  else if (definition.type === 'array') {
    const built = definition.build(fieldCtx);
    
    return defineType({
      ...built,
      ...base,
      type: definition.type,
    })
  } else if (definition.type === 'image') {
    const built = definition.build(fieldCtx);

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

    return defineType({
      ...built,
      ...base,
      type: definition.type,
      ...fields && { fields },
      ...fieldsets && { fieldsets },
      preview,
    })
  }
  else {
    throw new Error(`Unknown schema type for schema named "${name}"`)
  }
  
}