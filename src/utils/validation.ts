import { Rule } from 'sanity'

import { TranslatorFunction } from '../types'

interface ValidatorContext {
  t: TranslatorFunction
  fieldName: string
}

/**
 * Soft warning for i18nSlug fields: flags entries whose slug contains spaces or
 * capitals. Non-blocking — the frontend slugifies the URL regardless, so this
 * only nudges editors toward clean slugs. Pass `ctx.t.default`.
 *
 * Usage: f('slug', 'i18nSlug', { validation: slugFormatWarning(ctx.t.default) })
 */
export const slugFormatWarning =
  (t: TranslatorFunction) =>
  (rule: Rule): Rule =>
    rule
      .custom((value: any[]) => {
        const hasInvalid = (value ?? []).some(
          (entry) =>
            typeof entry?.value?.current === 'string' && /[A-Z\s]/.test(entry.value.current),
        )
        return hasInvalid ? t('validation.slugFormat') : true
      })
      .warning()

export const i18nValidators = {
  /** 1 & 5: Required (or Warning) for the Default Locale */
  requiredDefault:
    (defaultLocale: string, isRequired: boolean, ctx: ValidatorContext) =>
    (rule: Rule): Rule => {
      const customRule = rule.custom((value: (any | null)[]) => {
        const entry = value?.find((item) => item.language === defaultLocale)
        if (!entry?.value) {
          return ctx.t('validation.requiredDefault', undefined, { locale: defaultLocale })
        }
        return true
      })

      return isRequired ? customRule.error() : customRule.warning()
    },

  /** 2: All defined locales are required */
  requiredAll:
    (allLocales: string[], ctx: ValidatorContext) =>
    (rule: Rule): Rule => {
      return rule
        .custom((value: any[]) => {
          const missing = allLocales.filter(
            (lang) => !value?.find((item) => item.language === lang)?.value,
          )
          return missing.length === 0
            ? true
            : ctx.t('validation.requiredAll', undefined, { missing: missing.join(', ') })
        })
        .error()
    },

  /** 3 & 4: At least one (any) exists */
  atLeastOneExists:
    (isRequired: boolean, ctx: ValidatorContext) =>
    (rule: Rule): Rule => {
      // const fieldLabel = t(`${docName}.fields.${fieldName}.title`);
      const customRule = rule.custom((value: any[]) => {
        const hasValue = value?.some((item) => !!item.value)
        if (!hasValue) {
          return {
            message: ctx.t('validation.oneFieldMustExist', undefined),
            // Leaving 'path' out here targets the field itself
          }
        }
        return true
      })
      return isRequired ? customRule.error() : customRule.warning()
    },

  /** 6: Min/Max character limits with specific input highlighting */
  contentLimits:
    (limits: { min?: number; max?: number; warning?: boolean }, ctx: ValidatorContext) =>
    (rule: Rule): Rule => {
      const { min, max, warning } = limits

      const customRule = rule.custom((value: any[]) => {
        if (!value || value.length === 0) return true

        const invalidItems = value.filter((item) => {
          if (!item.value) return false
          const len = String(item.value).length
          if (min && len < min) return true
          if (max && len > max) return true
          return false
        })

        if (invalidItems.length > 0) {
          const message =
            min && !max
              ? ctx.t('validation.minLength', undefined, { min })
              : ctx.t('validation.maxLength', undefined, { max: max || 9999 })

          // This is the key: returning an array of path-specific errors
          if (warning) return message
          return invalidItems.map((item) => ({
            message,
            // This tells Sanity: "The error is inside the item with _key 'en' in the 'value' property"
            path: [{ _key: item._key }, 'value'],
          }))
        }

        return true
      })
      return warning ? customRule.warning() : customRule.error()
    },
}

export const validateRequiredArrayIfKind =
  (kind: string) =>
  (rule: Rule): Rule =>
    rule.custom((value, context) => {
      const isCorrectKind = context.document?.kind === kind

      // Check if it's the right kind and if the array is empty
      if (isCorrectKind && (!Array.isArray(value) || value.length === 0)) {
        return context.i18n.t('validation:generic.required')
      }

      return true
    })

export const validateRequiredIfKind =
  (kind: string) =>
  (rule: Rule): Rule =>
    rule.custom((value, context) => {
      const isCorrectKind = context.document?.kind === kind

      // Check if it's the right kind and if the array is empty
      if (isCorrectKind && !value) {
        return context.i18n.t('validation:generic.required')
      }

      return true
    })

/** Filled: non-empty string/number, an i18n array with at least one value, or an object with any filled field. */
const hasValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.some((item) => hasValue(item?.value))
  if (typeof value === 'object') {
    return Object.entries(value).some(([key, v]) => !key.startsWith('_') && hasValue(v))
  }
  return true
}

/**
 * Requires the given subfields of an object field (e.g. a `businessAddress`) and
 * marks each missing one on its own input. Nested subfields use dot paths
 * (`'address.zip'`). `warning: true` makes it non-blocking. `message` overrides the
 * translation key (default `validation.requiredField` / `validation.recommendedField`).
 * Pass `ctx.t.default`.
 *
 * Usage: f('billingAddress', 'businessAddress', { validation: requiredSubfields(['line1', 'zip'], ctx.t.default) })
 */
export const requiredSubfields =
  (
    fields: string[],
    t: TranslatorFunction,
    options: { warning?: boolean; message?: string } = {},
  ) =>
  (rule: Rule): Rule => {
    const customRule = rule.custom((value: Record<string, unknown> | undefined) => {
      const missing = fields
        .map((field) => field.split('.'))
        .filter((path) => !hasValue(path.reduce<any>((v, key) => v?.[key], value)))
      if (missing.length === 0) return true
      return missing.map((path) => ({
        message: t(
          options.message ??
            (options.warning ? 'validation.recommendedField' : 'validation.requiredField'),
        ),
        path,
      }))
    })
    return options.warning ? customRule.warning() : customRule.error()
  }
