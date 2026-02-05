import { Rule, FieldDefinition, type TypeReference } from 'sanity';
import { i18nValidators } from './validation';
import { ITSContext, FieldFactory, I18nRuleShortcut } from "../types";

// Map simple types to your internationalized plugin types
const typeMap: Record<string, string> = {
  // Your custom internationalized shorthand
  'i18nString': 'internationalizedArrayString',
  'i18nSlug': 'internationalizedArraySlug',
  'i18nImage': 'internationalizedArrayBaseImage',
  'i18nBaseImage': 'internationalizedArrayBaseImage',
  'i18nTextImage': 'internationalizedArrayLocaleTextsImage',
  'i18nDictImage': 'i18nDictImage',
  'i18nImage2': 'internationalizedArrayCustomImage',
  'i18nText':   'internationalizedArrayText',
  'i18nBlock':  'internationalizedArrayComplexPortableText',
  
  // Standard shorthand (optional, for convenience)
  'string':     'string',
  'text':       'text',
  'number':     'number',
  'boolean':    'boolean',
  'array':    'array',

  // text: 'internationalizedArrayText',
  // content: 'internationalizedArrayBlockContent', // Assuming you named your block type this
};

export const createFieldFactory = (namespace: string, ctx: ITSContext): FieldFactory => {
  const { config } = ctx;
  const t = ctx.t.default;
  const tStrict = ctx.t.strict;
  const defaultLocale = config.localization.defaultLocale;
  const allLocales = config.localization.fieldLocales;

  // const bla: FieldDefinition = {
  //   type: 'image'
  // }
  const runShortcut = (shortcut: I18nRuleShortcut, Rule: Rule, fieldName: string) => {
    const vCtx = { t, fieldName };
    
    switch (shortcut) {
      case 'requiredDefault': return i18nValidators.requiredDefault(defaultLocale, true, vCtx)(Rule);
      case 'requiredDefaultWarning': return i18nValidators.requiredDefault(defaultLocale, false, vCtx)(Rule);
      case 'requiredAll': return i18nValidators.requiredAll(allLocales, vCtx)(Rule);
      case 'atLeastOne': return i18nValidators.atLeastOneExists(true, vCtx)(Rule);
      case 'atLeastOneWarning': return i18nValidators.atLeastOneExists(false, vCtx)(Rule);
      default:
        if (typeof shortcut === 'object') {
          return i18nValidators.contentLimits(shortcut, vCtx)(Rule);
        }
        return null;
    }
  };

  return (fieldName, type = 'string', overrides = {}) => {
    let { to, input, of, i18n, validation, tKey, ...rest } = overrides;

    // remove references to disabled docs
    if (type === 'reference' && Array.isArray(to)) {
      to = to.filter((t) => {
        const target = t as TypeReference;
        return isValidRef(ctx, namespace, target.type, fieldName);
      });
    }
    if (type === 'array' && Array.isArray(of)) {
      of = of.filter((item) => {
        // 1. Check if the item is an object with a 'type' property
        if (typeof item !== 'object' || item === null) return true;

        // Use a type cast to 'any' locally to perform the check safely
        const itemDef = item as any;

        // 2. Handle References inside the array
        if (itemDef.type === 'reference' && Array.isArray(itemDef.to)) {
          // 'target' was implicitly 'any', so we type it here
          return itemDef.to.every((target: { type: string }) => {
            return isValidRef(ctx, namespace, target.type, fieldName);
            // if (!docDef) {
            //   console.warn(`Structure Error: Schema type "${target.type}" not found for reference in "${namespace}.${fieldName}".`);
            //   return false;
            // } else if (!ctx.featureRegistry.isDocEnabled(target.type)) {
            //   console.warn(`Structure Error: Schema type "${target.type}" is disabled for reference in "${namespace}.${fieldName}".`);
            //   return false;
            // }
            // return ctx.featureRegistry.isDocEnabled(target.type);
          });
        }

        // 3. Handle Custom Objects or Named Types inside the array
        // e.g. of: [{ type: 'product' }]
        if (itemDef.type && typeof itemDef.type === 'string') {
          if (itemDef.type === 'object') return true;
          return isValidRef(ctx, namespace, itemDef.type, fieldName);
        }

        return true; // Keep standard types like 'string', 'number', etc.

        // const schemaDef = item as SchemaTypeDefinition;
        // // If the array item is a reference, check its 'to' target
        // if (schemaDef.type === 'reference' && Array.isArray(schemaDef.to)) {
        //   return item.to.every(target => ctx.featureRegistry.isDocEnabled(target.type));
        // }
        // return true; // Keep non-reference items (or add logic for custom objects)
      });
    }

    // 1. Resolve the path. 
    // If tKey is provided: use it directly.
    // If not: use namespace.fields.fieldName
    const translationPath = tKey 
      ? tKey 
      : `${namespace}.fields.${fieldName}`;

    const description = tStrict(`${translationPath}.description`)
    const field: FieldDefinition = {
      name: fieldName,
      type: typeMap[type] || type,
      title: t(`${translationPath}.title`),
      ...description && { description },
      validation: (Rule: Rule) => {
        const rules: any[] = [];
        if (i18n) {
          const items = Array.isArray(i18n) ? i18n : [i18n];
          items.forEach(s => {
            const r = runShortcut(s, Rule, fieldName);
            if (r) rules.push(r);
          });
        }
        if (typeof validation === 'function') rules.push(validation(Rule));
        return rules.length ? rules : undefined;
      },
      ...(to && { to }),
      ...(of && { of }),
      ...(input && { ...input }),
      ...rest,
    };
    return field;
  };
};

const SANITY_INTERNAL_TYPES = ['block', 'string', 'number', 'boolean', 'image', 'file', 'date'];
const isValidRef = (ctx: ITSContext, namespace: string, type: string, fieldName: string) => {
  
  const docDef = ctx.featureRegistry.getSchema(type);
  if (!docDef) {
    console.warn(`Structure Error: Schema type "${type}" not found for reference in "${namespace}.${fieldName}".`);
    return false;
  } else if (!ctx.featureRegistry.isSchemaEnabled(type)) {
    console.warn(`Structure Error: Schema type "${type}" is disabled for reference in "${namespace}.${fieldName}".`);
    return false;
  }
  return true;
};