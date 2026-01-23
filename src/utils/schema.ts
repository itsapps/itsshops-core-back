import { LocalSchemaContext } from '../types';

// function resolve<T>(ext: T | ((t: TranslatorFunction) => T), t: TranslatorFunction): T {
//   return typeof ext === 'function' ? (ext as any)(t) : ext;
// }

export function shapeSchema(
  docName: string,
  coreFields: any[],
  ctx: LocalSchemaContext,
) {
  const { t, f, config } = ctx;
  const extension = config.schemaExtensions?.[docName];
  if (!extension) return { fields: coreFields, groups: [], fieldsets: [] };
  // const extension = config.schemaExtensions?.[docName];

  const resolve = (val: any) => (typeof val === 'function' ? val(t, f) : val);

  // Resolve all functional extensions into static Sanity objects
  const groups = resolve(extension?.groups) || [];
  const fieldsets = resolve(extension?.fieldsets) || [];
  const customFields = resolve(extension?.fields) || [];
  const overrides = resolve(extension?.overrides) || {};
  const order = extension?.order || [];

  // const { fields: customFields = [], order = [], overrides = {}, groups = [], fieldsets = [] } = extension;

  // 1. Combine all fields
  let allFields = [...coreFields, ...customFields];

  // 2. Apply Overrides (This is how we change groups/fieldsets of Core fields)
  allFields = allFields.map(field => {
    const override = overrides[field.name];
    return override ? { ...field, ...override } : field;
  });

  // 3. Sort
  if (order.length > 0) {
    allFields.sort((a, b) => {
      const posA = order.indexOf(a.name) === -1 ? 999 : order.indexOf(a.name);
      const posB = order.indexOf(b.name) === -1 ? 999 : order.indexOf(b.name);
      return posA - posB;
    });
  }

  return { fields: allFields, groups, fieldsets };
}