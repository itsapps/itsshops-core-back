import { FieldDefinition, FieldGroupDefinition, FieldsetDefinition } from 'sanity';
import { FieldContext, SchemaContext } from '../types';

export function shapeSchema(
  docName: string,
  coreFields: FieldDefinition[],
  ctx: FieldContext,
) {
  const extension = ctx.config.schemaExtensions?.[docName];
  if (!extension) return { fields: coreFields, groups: [], fieldsets: [] };

  // const resolve = (val: any) => (typeof val === 'function' ? val(ctx) : val);
  const resolveWithFieldCtx = (val: any) => (typeof val === 'function' ? val(ctx) : val);
  const resolveWithSchemaCtx = (val: any) => (typeof val === 'function' ? val(ctx as SchemaContext) : val);

  const groups: FieldGroupDefinition[] = resolveWithSchemaCtx(extension.groups) || [];
  const fieldsets: FieldsetDefinition[] = resolveWithSchemaCtx(extension.fieldsets) || [];
  const customFields: FieldDefinition[] = resolveWithFieldCtx(extension.fields) || [];
  const fieldOverrides = resolveWithFieldCtx(extension.fieldOverrides) || {};
  const order = extension.order || [];

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

  return {
    fields: allFields,
    groups,
    fieldsets
  };
}