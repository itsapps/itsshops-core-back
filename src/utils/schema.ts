import { FieldDefinition, FieldGroupDefinition, FieldsetDefinition } from 'sanity';
import { FieldContext, ITSContext, SchemaExtension } from '../types';

export function shapeSchema(
  docName: string,
  ctx: FieldContext,
  coreGroups: FieldGroupDefinition[] = [],
  coreFieldsets: FieldsetDefinition[] = [],
  coreFields: FieldDefinition[],
  extension?: SchemaExtension
) {
  // if (!extension) return { fields: coreFields, groups: coreGroups, fieldsets: coreFieldsets };

  // const resolve = (val: any) => (typeof val === 'function' ? val(ctx) : val);
  // const resolveWithFieldCtx = (val: any) => (typeof val === 'function' ? val(ctx) : val);
  // const resolveWithSchemaCtx = (val: any) => (typeof val === 'function' ? val(ctx as ITSContext) : val);

  // const groups: FieldGroupDefinition[] = resolveWithSchemaCtx(extension.groups) || [];
  // const fieldsets: FieldsetDefinition[] = resolveWithSchemaCtx(extension.fieldsets) || [];
  // const customFields: FieldDefinition[] = resolveWithFieldCtx(extension.fields) || [];
  // const fieldOverrides = resolveWithFieldCtx(extension.fieldOverrides) || {};
  // const order = extension.order || [];

  const customGroups = extension ? (typeof extension.groups === 'function' ? extension.groups(ctx) : extension.groups) || [] : [];
  const customFieldsets = extension ? (typeof extension.fieldsets === 'function' ? extension.fieldsets(ctx) : extension.fieldsets) || [] : [];
  const customFields = extension ? (typeof extension.fields === 'function' ? extension.fields(ctx) : extension.fields) || [] : [];
  const fieldOverrides = extension ? (typeof extension.fieldOverrides === 'function' ? extension.fieldOverrides(ctx) : extension.fieldOverrides) || {} : {};
  const order = extension?.order || [];
  const removeGroups = extension?.removeGroups || [];

  const groupMap = new Map<string, FieldGroupDefinition>();
  // Combine core and extension groups
  [...coreGroups, ...customGroups].forEach(group => {
    // ignore removed groups
    if (removeGroups.includes(group.name)) return;

    groupMap.set(group.name, {
      ...group,
      // Priority: 
      // 1. Existing title in the object (if manually set)
      // 2. Translation key based on docName.groups.groupName
      // 3. Translation key based on global groups.groupName
      // 4. Fallback to the name itself
      title: group.title || 
        ctx.t.strict(`${docName}.groups.${group.name}`) || 
        ctx.t.default(`groups.${group.name}`, group.name)
    });
  });
  // const mergedGroups = Array.from(groupMap.values());

  // 2. Combine Core + Custom
  let allFields = [...coreFields, ...customFields];

  // 3. Apply Overrides
  // This allows customers to move core fields into their new groups/fieldsets
  allFields = allFields.map(field => {
    const override = fieldOverrides[field.name];
    if (override) {
      return { ...field, ...override } as FieldDefinition;
    }
    return field;
  });

  // 3. Sort
  if (order.length > 0) {
    allFields.sort((a, b) => {
      const posA = order.indexOf(a.name) === -1 ? 999 : order.indexOf(a.name);
      const posB = order.indexOf(b.name) === -1 ? 999 : order.indexOf(b.name);
      return posA - posB;
    });
  }

  const allFieldsets = [...coreFieldsets, ...customFieldsets].map(fieldset => {
    const title = fieldset.title || 
      ctx.t.strict(`${docName}.fieldsets.${fieldset.name}`) ||  
      ctx.t.default(`fieldsets.${fieldset.name}`, fieldset.name)
    return { ...fieldset, title }
  })

  // return {
  //   fields: allFields,
  //   groups: mergedGroups,
  //   fieldsets
  // };
  
  return {
    fields: allFields,
    groups: Array.from(groupMap.values()),
    fieldsets: allFieldsets
  };
}