import { BlockDefinition, defineField, FieldDefinition, Rule, type TypeReference } from 'sanity'

import { createFieldTranslators } from '../localization/fieldTranslators'
import { CoreFactory, FieldFactory, FieldTranslators, I18nRuleShortcut, ITSContext } from '../types'
import { i18nValidators } from './validation'

const SANITY_INTERNAL_TYPES = ['block', 'string', 'number', 'boolean', 'image', 'file', 'date']

const isValidRef = (ctx: ITSContext, namespace: string, type: string, fieldName: string) => {
  if (type in SANITY_INTERNAL_TYPES) return true
  const schemaDef = ctx.featureRegistry.getSchema(type)
  if (!schemaDef) {
    console.warn(
      `Structure Error: Schema type "${type}" not found for reference in "${namespace}.${fieldName}".`,
    )
    return false
  } else if (!ctx.featureRegistry.isSchemaEnabled(type)) {
    // console.warn(`Schema type "${type}" is disabled for reference in "${namespace}.${fieldName}".`);
    return false
  }
  return true
}

// Map simple types to your internationalized plugin types
export const createFieldFactory = (
  namespace: string,
  ctx: ITSContext,
  fieldTranslators: FieldTranslators,
): FieldFactory => {
  const { config, t } = ctx
  const defaultLocale = config.localization.defaultLocale
  const allLocales = config.localization.fieldLocales

  // const bla: FieldDefinition = {
  //   type: 'image'
  // }
  const runShortcut = (shortcut: I18nRuleShortcut, rule: Rule, fieldName: string) => {
    const vCtx = { t: t.default, fieldName }

    switch (shortcut) {
      case 'requiredDefault':
        return i18nValidators.requiredDefault(defaultLocale, true, vCtx)(rule)
      case 'requiredDefaultWarning':
        return i18nValidators.requiredDefault(defaultLocale, false, vCtx)(rule)
      case 'requiredAll':
        return i18nValidators.requiredAll(allLocales, vCtx)(rule)
      case 'atLeastOne':
        return i18nValidators.atLeastOneExists(true, vCtx)(rule)
      case 'atLeastOneWarning':
        return i18nValidators.atLeastOneExists(false, vCtx)(rule)
      default:
        if (typeof shortcut === 'object') {
          return i18nValidators.contentLimits(shortcut, vCtx)(rule)
        }
        return null
    }
  }

  return (fieldName, type = 'string', overrides = {}) => {
    let { to, of } = overrides
    const { input, i18n, validation, ...rest } = overrides

    // remove references to disabled docs
    if (type === 'reference' && Array.isArray(to)) {
      to = to.filter((tRef) => {
        const target = tRef as TypeReference
        const valid = isValidRef(ctx, namespace, target.type, fieldName)
        return valid
      })
    }
    if (type === 'array' && Array.isArray(of)) {
      of = of.filter((item) => {
        // 1. Check if the item is an object with a 'type' property
        if (typeof item !== 'object' || item === null) return true

        // Use a type cast to 'any' locally to perform the check safely
        const itemDef = item as any

        // 2. Handle References inside the array
        if (itemDef.type === 'reference' && Array.isArray(itemDef.to)) {
          // TODO: autotranslate reference titles

          // 'target' was implicitly 'any', so we type it here
          return itemDef.to.every((target: { type: string }) => {
            return isValidRef(ctx, namespace, target.type, fieldName)
            // if (!docDef) {
            //   console.warn(`Structure Error: Schema type "${target.type}" not found for reference in "${namespace}.${fieldName}".`);
            //   return false;
            // } else if (!ctx.featureRegistry.isDocEnabled(target.type)) {
            //   console.warn(`Structure Error: Schema type "${target.type}" is disabled for reference in "${namespace}.${fieldName}".`);
            //   return false;
            // }
            // return ctx.featureRegistry.isDocEnabled(target.type);
          })
        }

        // 3. Handle Custom Objects or Named Types inside the array
        // e.g. of: [{ type: 'product' }]
        if (itemDef.type && typeof itemDef.type === 'string') {
          if (itemDef.type === 'object' || itemDef.type === 'string') return true
          return isValidRef(ctx, namespace, itemDef.type, fieldName)
        }

        return true // Keep standard types like 'string', 'number', etc.

        // const schemaDef = item as SchemaTypeDefinition;
        // // If the array item is a reference, check its 'to' target
        // if (schemaDef.type === 'reference' && Array.isArray(schemaDef.to)) {
        //   return item.to.every(target => ctx.featureRegistry.isDocEnabled(target.type));
        // }
        // return true; // Keep non-reference items (or add logic for custom objects)
      })
    }

    //input
    if (type === 'array' && input && input.of && Array.isArray(input.of)) {
      const ofs = input.of as any[]
      ofs.forEach((item) => {
        if (item.type === 'block') {
          const block = item as BlockDefinition
          fieldTranslators.block({ fieldName, block })
        }
      })
    }

    if (type === 'string' && rest.options) {
      const ops = rest.options as any
      if (ops.list && Array.isArray(ops.list)) {
        // find title if not already set
        ops.list.forEach((option: { title?: string; value: string }) => {
          option.title = option.title || fieldTranslators.option({ fieldName, value: option.value })
        })
      }
    }

    const title =
      rest.title ||
      fieldTranslators.default({ fieldGroup: 'fields', fieldName, attribute: 'title' })
    const description =
      rest.description ||
      fieldTranslators.strict({ fieldGroup: 'fields', fieldName, attribute: 'description' })

    const field = defineField({
      name: fieldName,
      type: ctx.i18nFieldTypes[type] || type,
      title,
      ...(description && { description }),
      validation: (rule: Rule) => {
        const rules: any[] = []
        if (i18n) {
          const items = Array.isArray(i18n) ? i18n : [i18n]
          items.forEach((s) => {
            const r = runShortcut(s, rule, fieldName)
            if (r) rules.push(r)
          })
        }
        if (typeof validation === 'function') rules.push(validation(rule))
        return rules.length ? rules : undefined
      },
      ...rest,
      ...(to && { to }),
      ...(of && { of }),
      ...(input && { ...input }),
    })

    return field
  }
}

export const createFactory = (namespace: string, ctx: ITSContext): CoreFactory => {
  const fieldTranslators = createFieldTranslators(namespace, ctx.t)
  const f = createFieldFactory(namespace, ctx, fieldTranslators)

  const extendField = <T extends FieldDefinition>(field: T): T => {
    const title = fieldTranslators.default({
      fieldGroup: 'fields',
      fieldName: field.name,
      attribute: 'title',
    })
    const description = fieldTranslators.default({
      fieldGroup: 'fields',
      fieldName: field.name,
      attribute: 'description',
    })
    return {
      title,
      ...(description && { description }),
      ...field,
    }
  }

  return {
    fields: f,
    fieldTranslators,
    reference: (name, options) => {
      const toArray = Array.isArray(options.to) ? options.to : [options.to]

      const filteredTo = toArray.filter((t) => {
        return isValidRef(ctx, namespace, t.type, name)
      })

      return extendField(
        defineField({
          type: 'reference',
          name,
          ...options,
          to: filteredTo,
        }),
      )
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
