import { Rule, FieldDefinition } from 'sanity';
import { i18nValidators } from './validation';
import { ITSContext, FieldFactory, I18nRuleShortcut } from "../types";

// Map simple types to your internationalized plugin types
const typeMap: Record<string, string> = {
  // Your custom internationalized shorthand
  'i18nString': 'internationalizedArrayString',
  'i18nImage': 'internationalizedArrayCropImage',
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
  const t = ctx.helpers.t.default;
  const tStrict = ctx.helpers.t.strict;
  const defaultLocale = config.localization.defaultLocale;
  const allLocales = config.localization.fieldLocales;

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
    const { i18n, validation, tKey, ...rest } = overrides;

    // 1. Resolve the path. 
    // If tKey is provided: use it directly.
    // If not: use namespace.fields.fieldName
    const translationPath = tKey 
      ? tKey 
      : `${namespace}.fields.${fieldName}`;

    const field: FieldDefinition = {
      name: fieldName,
      type: typeMap[type] || type,
      title: t(`${translationPath}.title`),
      description: tStrict(`${translationPath}.description`, {defaultValue: "shit huhu haha"}),
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