import { FieldDefinition } from 'sanity'

import { CustomerIcon } from '../../../assets/icons'
import { ITSSchemaDefinition } from '../../../types'

export const orderCustomer: ITSSchemaDefinition = {
  name: 'orderCustomer',
  type: 'object',
  feature: 'shop',
  icon: CustomerIcon,
  build: (ctx) => {
    const { f } = ctx

    const groups = ['general', 'billing', 'shipping'].map((name, index) => ({
      name,
      ...(index === 0 && { default: true }),
    }))

    const fieldsMap: Record<string, FieldDefinition[]> = {
      general: [
        f('locale', 'string', {
          options: {
            list: ctx.config.localization.uiLanguages.map((language) => ({
              title: language.title,
              value: language.id,
            })),
          },
          validation: (rule) => rule.required(),
        }),
        f('contactEmail', 'string', {
          validation: (rule) => rule.required(),
        }),
        f('supabaseId', 'string'),
      ],
      billing: [
        f('billingAddress', 'addressStrict', {
          // validation: (rule) => rule.required(),
        }),
      ],
      shipping: [f('shippingAddress', 'addressStrict', {})],
    }
    // 1. Ensure the accumulator is typed (replace 'Field' with your actual type)
    const fields = groups.flatMap(({ name }) => {
      const groupFields = fieldsMap[name] || []
      return groupFields.map((field: any) => ({
        ...field,
        group: name,
      }))
    })

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
  },
}
