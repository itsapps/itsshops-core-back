import { Package } from 'phosphor-react'
import { ITSContext, FieldContext, CoreDocument } from "../../types";


export const shippingCountry: CoreDocument = {
  name: 'shippingCountry',
  icon: Package,
  feature: 'shop',
  baseFields: (ctx: FieldContext) => {
    const { f, config } = ctx;
    return [
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
        validation: (rule) => rule.required()
      }),
    ]
  },
  preview: (ctx: ITSContext) => {
    return {
      select: {
        title: 'title',
      },
      prepare(s: any) {
        const { title } = s
        return {
          title: ctx.localizer.value(title),
        }
      },
    }
  }
};
