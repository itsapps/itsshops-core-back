import { Package } from 'phosphor-react'
import { ITSDocumentDefinition } from "../../types";


export const taxCountry: ITSDocumentDefinition = {
  name: 'taxCountry',
  type: 'document',
  icon: Package,
  feature: 'shop',
  build: (ctx) => {
    const { f, builders } = ctx;
    return {
      fields: [
        f('enabled', 'boolean', { initialValue: true }),
        builders.countryCodeField({documentType: 'taxCountry'}),
        f('rules', 'array', {
          of: [{ type: 'taxRule' }],
          validation: (Rule) => Rule.min(1),
        }),
      ],
      preview: {
        select: {
          code: 'countryCode',
          rules: 'rules',
        },
        prepare({ code, rules }) {
          const country = ctx.config.localization.countries.find(country => country.code === code)
          return {
            title: country ? `${country.code} (${ctx.localizer.dictValue(country.title)})` : code,
            // subtitle: Array.isArray(rules) ? `${rules.length} Tax Rules defined` : 'No rules',
            subtitle: ctx.t.default('taxCountry.preview.rules', 'Rules', { count: rules?.length || 0 }),
            media: country ? country.emoji : null
          }
        },
      }
    }
  }
};
