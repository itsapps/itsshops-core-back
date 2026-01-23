import { PriceInput } from '../../components/PriceInput';
import { SchemaContext, FieldFactory } from '../../types';

export const shipping = (ctx: SchemaContext, f: FieldFactory) => {
  const { t, config } = ctx;
  return ({
    name: 'shipping',
    title: t('shipping.schemaTitle'),
    type: 'object',
    fieldsets: [
      {
        name: 'shippingRate',
        title: t('shipping.fieldsets.rate'),
        options: { collapsed: true, collapsible: true },
        // Instead of global useAdminUI, use your config features
        // hidden: config.features.shippingDetailsHidden, 
      },
    ],
    fields: [
      // f('address', 'address', { validation: (Rule: any) => Rule.required() }),
      // f('shippingCountry', 'reference', {
      //   to: [{ type: 'shippingCountry' }],
      //   weak: true,
      //   fieldset: 'shippingRate',
      //   readOnly: true,
      //   hidden: true,
      // }),
      f('rateId', 'string', { fieldset: 'shippingRate', readOnly: true, hidden: true }),
      f('rateTitle', 'string', { fieldset: 'shippingRate', readOnly: true }),
      f('rateCost', 'number', {
        fieldset: 'shippingRate',
        components: { input: PriceInput },
        readOnly: true,
      }),
    ],  
  }) 
};