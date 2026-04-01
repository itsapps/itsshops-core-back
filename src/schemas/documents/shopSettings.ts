import type { ComponentType } from 'react'
import {
  NoteIcon,
  OrderIcon,
  PackageIcon,
  TruckIcon,
  VatBreakdownIcon,
  WebsiteIcon,
} from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const shopSettings: ITSDocumentDefinition = {
  name: 'shopSettings',
  type: 'document',
  icon: PackageIcon,
  feature: 'shop',
  isSingleton: true,
  build: (ctx) => {
    const { f, builders } = ctx

    const groupIcons: Record<string, ComponentType> = {
      displays: WebsiteIcon,
      shipping: TruckIcon,
      stock: PackageIcon,
      tax: VatBreakdownIcon,
      orders: OrderIcon,
      billing: NoteIcon,
    }

    const stockEnabled = ctx.featureRegistry.isFeatureEnabled('shop.stock')

    const groupNames = ['displays', 'shipping', ...(stockEnabled ? ['stock'] : []), 'tax', 'orders', 'billing']
    const groups = groupNames.map((name, index) => ({
      name,
      icon: groupIcons[name],
      ...(index === 0 && { default: true }),
    }))

    const fieldsMap: Record<string, any[]> = {
      displays: [
        f('shopPage', 'reference', {
          to: [{ type: 'page' }],
        }),
        ...builders.filterField(),
      ],
      shipping: [
        f('defaultCountry', 'reference', {
          to: [{ type: 'taxCountry' }],
        }),

        f('freeShippingCalculation', 'string', {
          options: {
            list: [{ value: 'beforeDiscount' }, { value: 'afterDiscount' }],
          },
          initialValue: 'afterDiscount',
        }),
      ],
      ...(stockEnabled
        ? { stock: [f('stockThreshold', 'number', { validation: (Rule) => Rule.positive() })] }
        : {}),
      tax: [
        f('defaultTaxCategory', 'reference', {
          to: [{ type: 'taxCategory' }],
        }),
      ],
      orders: [
        f('orderNumberPrefix', 'string'),
        f('invoiceNumberPrefix', 'string'),
        f('lastInvoiceNumber', 'number', {
          validation: (rule) => rule.required().positive(),
          initialValue: 0,
        }),
      ],
      billing: [f('billingAddress', 'businessAddress'), f('bankAccount', 'bankAccount')],
    }
    const fields = groups
      .map(({ name }) => [...fieldsMap[name].map((field) => ({ ...field, group: name }))])
      .flat()

    return {
      groups,
      fields,
    }
  },
}
