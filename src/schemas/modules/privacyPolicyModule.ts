import { PrivacyPolicyIcon as Icon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

/**
 * Marks where the generated privacy policy renders (core-front builds it from features, env and
 * settings.company). The fields only cover what core can't know: processing on the page that core
 * doesn't render (e.g. a map, an embed) and a data protection officer. No feature gate — every
 * site needs a privacy policy.
 */
export const privacyPolicyModule: ITSSchemaDefinition = {
  name: 'privacyPolicyModule',
  type: 'object',
  icon: Icon,
  build: (ctx) => {
    const { f } = ctx
    return {
      ...ctx.builders.module({
        fields: [
          f('extraSections', 'array', { of: [{ type: 'privacyPolicySection' }] }),
          f('dpoContact', 'i18nText'),
        ],
      }),
      preview: {
        prepare: () => ({ title: ctx.t.default('privacyPolicyModule.title'), media: Icon }),
      },
    }
  },
}
