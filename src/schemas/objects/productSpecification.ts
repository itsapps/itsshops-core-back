import { ITSSchemaDefinition } from '../../types'

/**
 * One label/value line of a product's specifications ("Material: 100% Baumwolle").
 * Used by `specifications` on `product` and `productVariant` (any product kind).
 */
export const productSpecification: ITSSchemaDefinition = {
  name: 'productSpecification',
  type: 'object',
  feature: 'shop',
  build: (ctx) => ({
    fields: [
      ctx.f('label', 'i18nString', { i18n: 'atLeastOne' }),
      ctx.f('value', 'i18nString', { i18n: 'atLeastOne' }),
    ],
    preview: {
      select: { label: 'label', value: 'value' },
      prepare({ label, value }) {
        return {
          title: ctx.localizer.value(label),
          subtitle: ctx.localizer.value(value),
        }
      },
    },
  }),
}
