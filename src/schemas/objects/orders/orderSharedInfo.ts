import { ITSSchemaDefinition, ProductType } from '../../../types';

import { PackageIcon } from '@sanity/icons'
import { FieldDefinition, isDev } from 'sanity'

export const orderSharedInfo: ITSSchemaDefinition = {
  name: 'orderSharedInfo',
  type: 'object',
  feature: 'shop',
  icon: PackageIcon,
  build: (ctx) => {
    const { f } = ctx;

    const groups = ['info'].map((name, index) => ({
      name, ...index === 0 && { default: true }
    }));

    const fieldsMap: Record<string, FieldDefinition[]> = {
      info: [
        f('type', 'string', {
          options: {
            list: [
              { title: ctx.t.default('orderItem.type.options.product'), value: ProductType.Product },
              { title: ctx.t.default('orderItem.type.options.productVariant'), value: ProductType.Variant },
              { title: ctx.t.default('orderItem.type.options.productBundle'), value: ProductType.Bundle },
            ],
          },
          validation: (Rule) => Rule.required(),
        }),

        f('productId', 'string', { validation: (Rule) => Rule.required() }),
        f('parentId', 'string'),
        f('productParentId', 'string'),

        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('variantTitle', 'i18nString'), // the aggregated title for variant options, e.g. "Rot, 0,75l"

        f('quantity', 'number', {
          validation: (Rule) => Rule.min(1).required(),
        }),
        f('recipeQuantity', 'number', {
          validation: (Rule) => Rule.min(1).required(),
        }),
        f('price', 'number', {
          validation: (Rule) => Rule.positive().required(),
        }),
        f('vatRate', 'number', {
          validation: (Rule) => Rule.positive().required(),
        }),
        f('vatAmount', 'number', {
          validation: (Rule) => Rule.min(1).required(),
        }),
        f('packed', 'boolean', {
          // validation: (Rule) => Rule.min(1).required(),
        }),


      ],
    }
    const fields = groups.map(({ name }) => ([
      ...fieldsMap[name].map(field => ({ ...field, group: name }))
    ])).flat();

    return {
      groups,
      fields,
      // preview: {
      //   select: {
      //     title: 'product.title',
      //     quantity: 'quantity',
      //     image: 'product.images.0.image',
      //   },
      //   prepare({ title, quantity, image }) {
      //     return {
      //       // title: ctx.localizer.value(title),
      //       title: title ? `${quantity}x "${ctx.localizer.value(title)}"` : '-',
      //       // subtitle: ctx.t.default('productBundleItem.preview.quantity', 'product', { count: quantity }),
      //       media: ctx.localizer.value<any>(image) || PackageIcon,
      //       // media: ProductMediaPreview({ info: `${quantity}x` }),
      //     }
      //   }
      // },
    }
  }
}