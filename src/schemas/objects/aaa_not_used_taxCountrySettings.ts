import { ITSSchemaDefinition } from '../../types';
import { PriceInput } from '../../components/PriceInput';
import {UserIcon} from '@sanity/icons'
import { Package } from 'phosphor-react'

export const taxCountrySettings: ITSSchemaDefinition = {
  name: 'taxCountrySettings',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f, builders } = ctx;
    return {
      fields: [
        builders.countryCodeField({documentType: 'taxCountry'}),
        f('rules', 'array', {
          of: [{ type: 'taxRule' }],
        }),
      ],
      preview: {
        select: {
          code: 'countryCode',
          rules0: 'rules.0.taxCategory.title',
          rules1: 'rules.1.taxCategory.title',
          rules2: 'rules.2.taxCategory.title',
          rules3: 'rules.3.taxCategory.title',
          rules4: 'rules.4.taxCategory.title',
          rules5: 'rules.5.taxCategory.title',
          rate0: 'rules.0.rate',
          rate1: 'rules.1.rate',
          rate2: 'rules.2.rate',
          rate3: 'rules.3.rate',
          rate4: 'rules.4.rate',
          rate5: 'rules.5.rate',
        },
        prepare({ code, rules0, rules1, rules2, rules3, rules4, rules5, rate0, rate1, rate2, rate3, rate4, rate5 }) {
          const taxCategories = [rules0, rules1, rules2, rules3, rules4, rules5]
          const rates = [rate0, rate1, rate2, rate3, rate4, rate5]
          const pairs = taxCategories.map((obj, i) => [obj, rates[i]]);
          const formatted = pairs.map(([obj, value]) => {
            const title = ctx.localizer.value(obj);
            const hasValue = value != null; // keeps 0!

            if (title && hasValue) return `${title}: ${value}%`;
            if (title) return title;
            if (hasValue) return `${value}%`;
            return undefined;
          }).filter(Boolean).join(', ');

          const country = ctx.config.localization.countries.find(country => country.value === code)
          const title = country ? `${country.value} (${ctx.localizer.dictValue(country.title)})` : code
          return {
            title,
            subtitle: formatted,
            // subtitle: [rules0, rules1, rules2, rules3, rules4, rules5].filter(Boolean).map(o => ctx.localizer.value(o)).join(', '),
            // subtitle: rules?.length,
          }
        },
      }
    }
  },
}
