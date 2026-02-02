import { Rule, FieldDefinition, type TypeReference } from 'sanity';
import { i18nValidators } from './validation';
import { ITSContext, FieldFactory, I18nRuleShortcut } from "../types";

// Map simple types to your internationalized plugin types
const typeMap: Record<string, string> = {
  // Your custom internationalized shorthand
  'i18nString': 'internationalizedArrayString',
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
    let { to, of, i18n, validation, tKey, ...rest } = overrides;

    // remove references to disabled docs
    if (type === 'reference' && Array.isArray(to)) {
      to = to.filter((t) => {
        const target = t as TypeReference;
        const docDef = ctx.featureRegistry.getDoc(target.type);
        if (!docDef) {
          console.warn(`Structure Error: Schema type "${target.type}" not found for reference.`);
          return false;
        }
        return ctx.featureRegistry.isDocEnabled(target.type);
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
          return itemDef.to.every((target: { type: string }) => 
            ctx.featureRegistry.isDocEnabled(target.type)
          );
        }

        // 3. Handle Custom Objects or Named Types inside the array
        // e.g. of: [{ type: 'product' }]
        if (itemDef.type && typeof itemDef.type === 'string') {
          // If the type name itself is a registered document, check if it's enabled
          const docDef = ctx.featureRegistry.getDoc(itemDef.type);
          if (docDef) {
            return ctx.featureRegistry.isDocEnabled(itemDef.type);
          }
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
      ...rest,
    };
    return field;
  };
};

// export const createFieldFactory = (docName: string, ctx: ITSContext): FieldFactory => {
//   const { t } = ctx;
  
//   /**
//    * @param fieldName - The key in your JSON and the name in Sanity
//    * @param type - 'string', 'text', 'content', or any native Sanity type like 'image' or 'reference'
//    * @param overrides - Manual Sanity properties (validation, hidden, etc.)
//    */

//   return (fieldName: string, type: string = 'string', overrides = {}) => {
//     const path = `${docName}.fields.${fieldName}`;
//     const { i18n, validation, ...rest } = overrides;
    
//     // 1. Resolve the actual Sanity type
//     // If it's in our map, use the internationalized version. Otherwise, use raw type.
//     const finalType = typeMap[type] || type;
    
//     return {
//       name: fieldName,
//       type: finalType,
//       title: t(`${path}.title`),
//       description: t(`${path}.description`),
//       validation: (Rule: Rule) => {
//         let rules = [];

//         // Handle your 'atLeastOne' logic via the shortcut
//         if (i18n === 'atLeastOne' || i18n === 'atLeastOneWarning') {
//           const isRequired = i18n === 'atLeastOne';
//           rules.push(i18nValidators.atLeastOneExists({ t, fieldName, docName, isRequired })(Rule));
//         }
//         if (typeof i18n === 'object' && 'max' in i18n) {
//           rules.push(i18nValidators.maxLength(i18n.max, {
//             t, fieldName, docName, isRequired: !i18n.warning
//           })(Rule));
//         }

//         // Allow adding standard sanity rules (e.g. .min(5))
//         if (typeof validation === 'function') {
//           rules.push(validation(Rule));
//         } else if (validation) {
//           // If validation was already a Rule or an array, just push it
//           rules.push(validation);
//         }
        
//         return rules;
//       },
//       ...rest,
//     };
//   };
// };