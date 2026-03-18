import { BlockDefinition, defineField, FieldDefinition, Rule, type TypeReference } from 'sanity'

import { createFieldTranslators } from '../localization/fieldTranslators'
import { CoreFactory, FieldFactory, FieldTranslators, I18nRuleShortcut, ITSContext } from '../types'
import { i18nValidators } from './validation'

const SANITY_INTERNAL_TYPES = ['block', 'string', 'number', 'boolean', 'image', 'file', 'date']

const isValidRef = (ctx: ITSContext, namespace: string, type: string, fieldName: string) => {
  if (SANITY_INTERNAL_TYPES.includes(type)) return true
  const schemaDef = ctx.featureRegistry.getSchema(type)
  if (!schemaDef) {
    console.warn(`Structure Error: Schema type "${type}" not found for reference in "${namespace}.${fieldName}".`)
    return false
  }
  return ctx.featureRegistry.isSchemaEnabled(type)
}

const isNoCreate = (ctx: ITSContext, type: string) => {
  const schemaDef = ctx.featureRegistry.getDoc(type)
  return schemaDef?.allowCreate === false
}


export const createFieldFactory = (
  namespace: string,
  ctx: ITSContext,
  fieldTranslators: FieldTranslators,
): FieldFactory => {
  const { config, t } = ctx
  const defaultLocale = config.localization.defaultLocale
  const allLocales = config.localization.fieldLocales

  const runShortcut = (shortcut: I18nRuleShortcut, rule: Rule, fieldName: string) => {
    const vCtx = { t: t.default, fieldName }
    switch (shortcut) {
      case 'requiredDefault': return i18nValidators.requiredDefault(defaultLocale, true, vCtx)(rule)
      case 'requiredDefaultWarning': return i18nValidators.requiredDefault(defaultLocale, false, vCtx)(rule)
      case 'requiredAll':            return i18nValidators.requiredAll(allLocales, vCtx)(rule)
      case 'atLeastOne':             return i18nValidators.atLeastOneExists(true, vCtx)(rule)
      case 'atLeastOneWarning':      return i18nValidators.atLeastOneExists(false, vCtx)(rule)
      default:
        if (typeof shortcut === 'object') return i18nValidators.contentLimits(shortcut, vCtx)(rule)
        return null
    }
  }

  return (fieldName, type = 'string', overrides = {}) => {
    let { to, of } = overrides
    const { i18n, validation, ...rest } = overrides

    if (type === 'reference' && Array.isArray(to)) {
      to = to.filter((tRef) => isValidRef(ctx, namespace, (tRef as TypeReference).type, fieldName))
      if (to.some((tRef) => isNoCreate(ctx, (tRef as TypeReference).type))) {
        rest.options = { ...(rest.options as object), disableNew: true }
      }
    }

    if (type === 'array' && Array.isArray(of)) {
      of = of.reduce<typeof of>((acc, item) => {
        if (typeof item !== 'object' || item === null) return [...acc, item]
        const itemDef = item as any

        if (itemDef.type === 'block') {
          fieldTranslators.block({ fieldName, block: itemDef as BlockDefinition })
          return [...acc, itemDef]
        }

        if (itemDef.type === 'reference' && Array.isArray(itemDef.to)) {
          const disableNew = itemDef.to.some((target: { type: string }) =>
            isNoCreate(ctx, target.type),
          )
          const validTargets = itemDef.to.filter((target: { type: string }) =>
            isValidRef(ctx, namespace, target.type, fieldName),
          )
          if (validTargets.length === 0) return acc
          return [
            ...acc,
            {
              ...itemDef,
              to: validTargets,
              ...(disableNew && { options: { ...itemDef.options, disableNew: true } }),
            },
          ]
        }

        if (itemDef.type && typeof itemDef.type === 'string') {
          if (itemDef.type === 'object' || itemDef.type === 'string') return [...acc, item]
          if (!isValidRef(ctx, namespace, itemDef.type, fieldName)) return acc
        }

        return [...acc, item]
      }, [])
    }

    if (type === 'string' && rest.options) {
      const ops = rest.options as any
      if (ops.list && Array.isArray(ops.list)) {
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

    return defineField({
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
    })
  }
}

export const createFactory = (namespace: string, ctx: ITSContext): CoreFactory => {
  const fieldTranslators = createFieldTranslators(namespace, ctx.t)
  const f = createFieldFactory(namespace, ctx, fieldTranslators)

  const extendField = <T extends FieldDefinition>(field: T): T => {
    const title = fieldTranslators.default({ fieldGroup: 'fields', fieldName: field.name, attribute: 'title' })
    const description = fieldTranslators.default({ fieldGroup: 'fields', fieldName: field.name, attribute: 'description' })
    return { title, ...(description && { description }), ...field }
  }

  return {
    fields: f,
    fieldTranslators,
    reference: (name, options) => {
      const toArray = Array.isArray(options.to) ? options.to : [options.to]
      const filteredTo = toArray.filter((t) => isValidRef(ctx, namespace, t.type, name))
      return extendField(defineField({ type: 'reference', name, ...options, to: filteredTo }))
    },
  }
}
