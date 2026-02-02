import { SchemaTypeDefinition } from 'sanity';
import { ITSObjectDefinition, ITSImageDefinition, ITSArrayDefinition, ITSSchemaDefinition, ITSDocumentDefinition, ITSContext, FieldContext } from '../types'
import { createFieldFactory, shapeSchema } from "../utils";
// import { Package } from 'phosphor-react'
// import { test } from './objects/test';
// import { test2 } from './objects/test2';

export function buildSchemas(ctx: ITSContext): SchemaTypeDefinition[] {
  const objectBuilders = ctx.featureRegistry.getEnabledObjects();
  // const objects = objectBuilders.map(b => createObjectSchema(ctx, b))
  // const objects = objectBuilders.map(b => ({ type: 'object', ...createDefinition(ctx, b)}))

  const documentBuilders = ctx.featureRegistry.getEnabledDocs();
  // const documents = documentBuilders.map(b => createDocumentSchema(ctx, b))
  // const documents = documentBuilders.map(b => ({ type: 'document', ...createDefinition(ctx, b)}))

  const defs = [...objectBuilders, ...documentBuilders].map(b => createDefinition(ctx, b));
  return defs
  // return [
  //   // {
  //   //   name: 'shippingRate2',
  //   //   title: 'shippingRate2',
  //   //   type: 'object',
  //   //   icon: Package,
  //   //   fields: [
  //   //     {
  //   //       name: 'locale',
  //   //       title: 'Locale',
  //   //       type: 'internationalizedArrayString',
  //   //     }
  //   //   ]
  //   // },
  //   ...objects,
  //   ...documents,
  // ]
}

export function createDefinition(ctx: ITSContext, definition: ITSSchemaDefinition): SchemaTypeDefinition {
  const extension = ctx.config.schemaExtensions?.[definition.name];
  const name = definition.name

  const f = createFieldFactory(name, ctx);
  const fieldCtx: FieldContext = { ...ctx, f };
  
  const icon = extension?.icon ?? definition.icon
  const title = definition.title ?? ctx.t.default(`${name}.title`)
  const description = definition.description ?? ctx.t.strict(`${name}.description`)

  if (definition.type === 'document' || definition.type === 'object') {
    const def = definition as ITSObjectDefinition | ITSDocumentDefinition
    const builtt = def.build(fieldCtx);

    // const ext = extension as DocumentSchemaExtension | ObjectSchemaExtension;
    // const groups = builtt.groups;
    // const fieldsets = builtt.fieldsets;

    const { fields, groups, fieldsets } = shapeSchema(
      name,
      fieldCtx,
      builtt.groups,
      builtt.fieldsets,
      builtt.fields,
      extension
    );
    // const coreGroups = typeof builtt.groups === 'function' 
    //   ? builtt.groups(ctx) 
    //   : builtt.groups || [];
    // const coreFieldsets = typeof definition.fieldsets === 'function' 
    //   ? definition.fieldsets(ctx) 
    //   : definition.fieldsets || [];

    const preview = extension?.preview ?
      extension.preview(ctx) :
      builtt.preview
    
    return {
      ...builtt,
      type: definition.type,
      description,
      name,
      title,
      ...icon && { icon },
      fields,
      ...groups && { groups },
      ...fieldsets && { fieldsets },
      preview,
      // groups,
      // fieldsets
    } as SchemaTypeDefinition
  }
  
  else if (definition.type === 'array') {
    const def = definition as ITSArrayDefinition
    const builtt = def.build({ ...ctx, f });
    
    // ... nur fields, fieldOverrides, order
    return {
      ...builtt,
      type: definition.type,
      description,
      name,
      title,
      ...icon && { icon },
    } as SchemaTypeDefinition
  } else if (definition.type === 'image') {
    const def = definition as ITSImageDefinition
    const builtt = def.build({ ...ctx, f });

    const { fields, fieldsets } = shapeSchema(
      name,
      fieldCtx,
      [],
      builtt.fieldsets,
      builtt.fields || [],
      extension
    );
    
    const preview = extension?.preview ?
      extension.preview(ctx) :
      builtt.preview

    return {
      ...builtt,
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
  
  // return {
  //   name: def.name,
  //   type: def.type,
  //   title: def.title ?? ctx.t.default(`${def.name}.title`),
  //   icon: def.icon,
  //   ...built,
  // };
}

// function createDefinition2(
//   ctx: ITSContext,
//   definition: ITSSchemaDefinition
// ): SchemaTypeDefinition {
//   const name = definition.name;
//   const f = createFieldFactory(name, ctx);
//   const fieldCtx: FieldContext = { ...ctx, f };
//   const extension = ctx.config.schemaExtensions?.[name];

//   const coreGroups = typeof definition.groups === 'function' 
//     ? definition.groups(ctx) 
//     : definition.groups || [];
//   const coreFieldsets = typeof definition.fieldsets === 'function' 
//     ? definition.fieldsets(ctx) 
//     : definition.fieldsets || [];

//   const { fields, groups, fieldsets } = shapeSchema(
//     name,
//     fieldCtx,
//     coreGroups,
//     coreFieldsets,
//     definition.fields(fieldCtx),
//     extension
//   );

//   const icon = extension?.icon ?? definition.icon

//   const preview = extension?.preview ?
//     extension.preview(ctx) :
//     definition.preview ? definition.preview(ctx) : undefined
  
//   return {
//     name,
//     title: definition.title ?? ctx.t.default(`${name}.title`),
//     ...icon && { icon },
//     ...groups && { groups },
//     ...fieldsets && { fieldsets },
//     fields: [
//       // {
//       //   name: 'rates2',
//       //   type: 'array',
//       //   of: [{ type: 'shippingRate2' }],
//       //   validation: (rule) => rule.required()
//       // },
//       ...fields,
//     ],
//     preview
//   };
// }

// const createDocumentSchema = (
//   ctx: ITSContext,
//   documentDefinition: ITSDocumentDefinition,
// ): SchemaTypeDefinition => {
//   const definition = createPartialDefinition(ctx, documentDefinition);
  
//   return {
//     type: 'document',
//     ...definition,
//   };
// };

// const createObjectSchema = (
//   ctx: ITSContext,
//   objectDefinition: ITSObjectDefinition,
// ): SchemaTypeDefinition => {
//   const f = createFieldFactory(objectDefinition.name, ctx);
  
//   const built = objectDefinition.build({ ...ctx, f });
//   const finalType = built.type || 'object';
//   // const fieldsAdjustment = (finalType === 'object' && !built.fields) // TODO: check this
//   //   ? { fields: [] } 
//   //   : {};

//   const obj = {
//     name: objectDefinition.name,
//     // type: finalType,
//     // ...objectDefinition.icon && { icon: objectDefinition.icon},
//     title: ctx.t.default(`${objectDefinition.name}.title`),
//     ...built,
//     // ...fieldsAdjustment,
//   } as SchemaTypeDefinition

//   return obj
// }

// const createObjectSchema2 = (
//   ctx: ITSContext,
//   objectDefinition: ITSObject,
// ): SchemaTypeDefinition => {
//   const f = createFieldFactory(objectDefinition.name, ctx);
  
//   const fields = objectDefinition.fields({ ...ctx, f });
  
//   const obj = {
//     name: objectDefinition.name,
//     type: 'object',
//     icon: Package,
//     // ...objectDefinition.icon && { icon: objectDefinition.icon},
//     title: ctx.t.default(`${objectDefinition.name}.title`),
//     fields,
//     preview: {
//       select: {
//         title: 'title'
//       },
//       prepare(s: any) {
//         const { title } = s
//         return {
//           title: ctx.localizer.value(title),
//           media: Package
//         }
//       },
//     }
//     // ...fieldsAdjustment,
//   } as SchemaTypeDefinition

//   return obj
// }

// const createObjectSchema3 = (
//   ctx: ITSContext,
//   objectDefinition: ITSObject2,
// ): SchemaTypeDefinition => {
//   const name = objectDefinition.name
//   const f = createFieldFactory(name, ctx);
//   const fieldCtx: FieldContext = { ...ctx, f };

//   const extension = ctx.config.schemaExtensions?.[name];

//   const { fields, groups, fieldsets } = shapeSchema(
//     name,
//     fieldCtx,
//     [],
//     [],
//     objectDefinition.fields(fieldCtx),
//     extension
//   );

//   const preview = objectDefinition.preview && objectDefinition.preview(ctx);
  
//   const obj = {
//     name: objectDefinition.name,
//     type: 'object',
//     icon: Package,
//     // ...objectDefinition.icon && { icon: objectDefinition.icon},
//     title: ctx.t.default(`${objectDefinition.name}.title`),
//     fields,
//     ...groups && { groups },
//     ...fieldsets && { fieldsets },
//     preview,
//   } as SchemaTypeDefinition

//   return obj
// }