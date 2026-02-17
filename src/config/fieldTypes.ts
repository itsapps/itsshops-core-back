
export const i18nFieldTypes = [
  'string',
  'url',
  'text',
  'slug',
  'cropImage',
  'baseImage',
];

export function createi18nFieldTypes(fieldTypes: string[]): Record<string, string> {
  const typeMap: Record<string, string> = Object.fromEntries(
    fieldTypes.map(type => [
      `i18n${type.charAt(0).toUpperCase() + type.slice(1)}`, 
      `internationalizedArray${type.charAt(0).toUpperCase() + type.slice(1)}`
    ])
  );
  return typeMap
}