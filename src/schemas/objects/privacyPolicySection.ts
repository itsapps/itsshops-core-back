import { ITSSchemaDefinition } from '../../types'

/** A shop-specific privacy policy section (`privacyPolicyModule.extraSections`). */
export const privacyPolicySection: ITSSchemaDefinition = {
  name: 'privacyPolicySection',
  type: 'object',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('heading', 'i18nString', { i18n: 'requiredDefault' }),
        f('text', 'i18nText', { i18n: 'requiredDefault' }),
      ],
      preview: {
        select: { heading: 'heading' },
        prepare: ({ heading }) => ({ title: ctx.localizer.value(heading) || '—' }),
      },
    }
  },
}
