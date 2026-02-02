import { Package } from 'phosphor-react'
import { ITSDocumentDefinition } from "../../types";


export const shippingCountry: ITSDocumentDefinition = {
  name: 'shippingCountry',
  type: 'document',
  icon: Package,
  feature: 'shop',
  build: (ctx) => {
    const { f, config } = ctx;
    return {
      fields: [
        f('isDefault', 'boolean', { initialValue: false }),
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('code', 'string', {
          options: {
            list: config.localization.countries.map(country => ({ title: `${country.value} (${ctx.localizer.dictValue(country.title)})`, value: country.value }))
          },
          initialValue: config.defaultCountryCode,
          validation: (Rule) => Rule.required()
        }),
        f('taxRate', 'number', { validation: (Rule) => Rule.required() }),
        f('rates', 'array', {
          of: [{ type: 'shippingRate' }],
          icon: Package,
          validation: (rule) => rule.required()
        }),
      ],
      preview: {
        select: {
          title: 'title',
        },
        prepare({ title }) {
          return {
            title: ctx.localizer.value(title),
          }
        },
      }
    }
  }
};
