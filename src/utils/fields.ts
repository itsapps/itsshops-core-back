import { Rule, FieldDefinition, defineField, type TypeReference, ReferenceTo } from 'sanity';
import { i18nValidators } from './validation';
import { ITSContext, CoreFactory, FieldFactory, I18nRuleShortcut } from "../types";

// Map simple types to your internationalized plugin types
const typeMap: Record<string, string> = {
  // Your custom internationalized shorthand
  'i18nString': 'internationalizedArrayString',
  'i18nUrl': 'internationalizedArrayUrl',
  'i18nSlug': 'internationalizedArraySlug',
  'i18nCropImage': 'internationalizedArrayCropImage',
  'i18nImage': 'internationalizedArrayBaseImage',
  'i18nLocaleImage': 'internationalizedArrayLocaleImage',
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
  const { config, t } = ctx;
  const defaultLocale = config.localization.defaultLocale;
  const allLocales = config.localization.fieldLocales;

  // const bla: FieldDefinition = {
  //   type: 'image'
  // }
  const runShortcut = (shortcut: I18nRuleShortcut, Rule: Rule, fieldName: string) => {
    const vCtx = { t: t.default, fieldName };
    
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

  const getTranslationKeypaths = ({namespace, fieldGroup, fieldName, attribute }: {namespace: string, fieldGroup: string, fieldName: string, attribute?: string}): {local: string, global: string} => {
    // const groupPath = `${fieldGroup}.${fieldName}.${attribute}`
    const groupPath = [fieldGroup, fieldName, attribute].filter(Boolean).join('.')
    return {
      local: `${namespace}.${groupPath}`,
      global: groupPath
    }
  };

  const findDefault = ({namespace, fieldGroup, fieldName, attribute }: {namespace: string, fieldGroup: string, fieldName: string, attribute?: string}): string => {
    const translationPaths = getTranslationKeypaths({ namespace, fieldGroup, fieldName, attribute })
    return ctx.t.strict(translationPaths.local) || ctx.t.default(translationPaths.global, fieldName)
  };
  const findStrict = ({namespace, fieldGroup, fieldName, attribute }: {namespace: string, fieldGroup: string, fieldName: string, attribute?: string}): string | undefined => {
    const translationPaths = getTranslationKeypaths({ namespace, fieldGroup, fieldName, attribute })
    return ctx.t.strict(translationPaths.local) || ctx.t.strict(translationPaths.global)
  };
  const findOption = ({namespace, fieldName, value }: {namespace: string, fieldName: string, value: string}): string | undefined => {
    const local = `${namespace}.fields.${fieldName}.options.${value}`
    const global = `${fieldName}.options.${value}`

    return ctx.t.strict(local) || ctx.t.strict(global) || ctx.t.default(`options.${value}`, value)
  };

  return (fieldName, type = 'string', overrides = {}) => {
    let { to, input, of, i18n, validation, ...rest } = overrides;

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
          // TODO: autotranslate reference titles

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
          if (itemDef.type === 'object' || itemDef.type === 'string') return true;
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

    if (type === 'string' && rest.options) {
      const ops = rest.options as any;
      if ( ops.list && Array.isArray(ops.list)) {
        // find title if not already set
        ops.list.forEach((option: { title?: string, value: string }) => {
          option.title = option.title || findOption({namespace, fieldName, value: option.value })
        })
      }
    }

    const title = rest.title || findDefault({namespace, fieldGroup: 'fields', fieldName, attribute: 'title' })
    const description = rest.description || findStrict({namespace, fieldGroup: 'fields', fieldName, attribute: 'description' })

    const field = defineField({
      name: fieldName,
      type: typeMap[type] || type,
      title,
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
      // ...(options && { options }),
      ...(to && { to }),
      ...(of && { of }),
      ...(input && { ...input }),
      ...rest,
    });
    return field;
  };
};

const SANITY_INTERNAL_TYPES = ['block', 'string', 'number', 'boolean', 'image', 'file', 'date'];
const isValidRef = (ctx: ITSContext, namespace: string, type: string, fieldName: string) => {
  if (type in SANITY_INTERNAL_TYPES) return true
  const schemaDef = ctx.featureRegistry.getSchema(type);
  if (!schemaDef) {
    console.warn(`Structure Error: Schema type "${type}" not found for reference in "${namespace}.${fieldName}".`);
    return false;
  } else if (!ctx.featureRegistry.isSchemaEnabled(type)) {
    console.warn(`Structure Error: Schema type "${type}" is disabled for reference in "${namespace}.${fieldName}".`);
    return false;
  }
  return true;
};


export const createFactory = (namespace: string, ctx: ITSContext): CoreFactory => {
  const f = createFieldFactory(namespace, ctx);

  const getTranslationKeypaths = ({namespace, fieldGroup, fieldName, attribute }: {namespace: string, fieldGroup: string, fieldName: string, attribute?: string}): {local: string, global: string} => {
    // const groupPath = `${fieldGroup}.${fieldName}.${attribute}`
    const groupPath = [fieldGroup, fieldName, attribute].filter(Boolean).join('.')
    return {
      local: `${namespace}.${groupPath}`,
      global: groupPath
    }
  };
  const findDefault = ({namespace, fieldGroup, fieldName, attribute }: {namespace: string, fieldGroup: string, fieldName: string, attribute?: string}): string => {
    const translationPaths = getTranslationKeypaths({ namespace, fieldGroup, fieldName, attribute })
    return ctx.t.strict(translationPaths.local) || ctx.t.default(translationPaths.global, fieldName)
  };
  const findStrict = ({namespace, fieldGroup, fieldName, attribute }: {namespace: string, fieldGroup: string, fieldName: string, attribute?: string}): string | undefined => {
    const translationPaths = getTranslationKeypaths({ namespace, fieldGroup, fieldName, attribute })
    return ctx.t.strict(translationPaths.local) || ctx.t.strict(translationPaths.global)
  };
  const extendField = <T extends FieldDefinition>(field: T): T => {
  // const extendField = (field: FieldDefinition) => {
    const title = findDefault({namespace, fieldGroup: 'fields', fieldName: field.name, attribute: 'title' })
    const description = findDefault({namespace, fieldGroup: 'fields', fieldName: field.name, attribute: 'description' })
    return {
      title,
      ...description && { description },
      ...field,
    }
  }
  
  return {
    fields: f,
    reference: (name, options) => {
      const toArray = Array.isArray(options.to)
        ? options.to
        : [options.to];

      const filteredTo = toArray.filter((t) => {
        return isValidRef(ctx, namespace, t.type, name);
      });

      return extendField(defineField({
        type: 'reference',
        name,
        ...options,
        to: filteredTo,
      }))
    },
    // array: (name, options) => {
    //   const filteredOf = options.of.filter((item) => {
    //     if (typeof item !== 'object' || item === null) return true;

    //     // return isValidRef(ctx, namespace, t.type, name);
    //     if (item.type === 'reference') {
    //       const to = Array.isArray(item.to) ? item.to : [item.to];
    //     }
    //   });
      
    //   return extendField(defineField({
    //     type: 'array',
    //     name,
    //     ...options,
    //     // of: filteredOf,
    //   }))
    // }
  }
}