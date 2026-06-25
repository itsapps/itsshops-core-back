import type { ComponentType } from 'react'
import { FieldDefinition } from 'sanity'
import {
  NoteIcon,
  NotificationIcon,
  OrderIcon,
  PackageIcon,
  TruckIcon,
  VatBreakdownIcon,
  WebsiteIcon,
  OrderWithdrawalIcon,
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
      notifications: NotificationIcon,
      returns: OrderWithdrawalIcon,
    }

    const stockEnabled = ctx.featureRegistry.isFeatureEnabled('shop.stock')
    const vouchersEnabled = ctx.featureRegistry.isFeatureEnabled('shop.vouchers')

    const groupNames = [
      'billing',
      'orders',
      'shipping',
      'returns',
      'tax',
      'notifications',
      ...(stockEnabled ? ['stock'] : []),
      'displays',
    ]
    const groups = groupNames.map((name, index) => ({
      name,
      icon: groupIcons[name],
      ...(index === 0 && { default: true }),
    }))

    const fieldsMap: Record<string, FieldDefinition[]> = {
      displays: [
        f('shopPage', 'reference', {
          to: [{ type: 'page' }],
        }),
        f('termsPage', 'reference', {
          to: [{ type: 'page' }],
        }),
        f('withdrawalPolicyPage', 'reference', {
          to: [{ type: 'page' }],
        }),
        ...builders.filterField(),
      ],
      shipping: [
        f('defaultCountry', 'reference', {
          to: [{ type: 'taxCountry' }],
        }),

        ...(vouchersEnabled
          ? [
              f('freeShippingCalculation', 'string', {
                options: {
                  list: [{ value: 'beforeDiscount' }, { value: 'afterDiscount' }],
                },
                initialValue: 'afterDiscount',
              }),
            ]
          : []),
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
        f('lastInvoiceNumber', 'number', {
          validation: (rule) => rule.required().positive(),
          initialValue: 0,
        }),
        f('orderNumberPrefix', 'string'),
        f('invoiceNumberPrefix', 'string'),
      ],
      billing: [f('billingAddress', 'businessAddress'), f('bankAccount', 'bankAccount')],
      returns: [
        f('returnAddress', 'businessAddress'),
        f('returnShippingBorneBy', 'string', {
          options: {
            list: [{ value: 'customer' }, { value: 'merchant' }],
            layout: 'radio',
          },
          initialValue: 'customer',
        }),
        f('returnPolicyNote', 'i18nText'),
      ],
      notifications: [
        f('senderName', 'string'),
        f('senderEmail', 'string', {
          validation: (rule) => rule.email(),
        }),
      ],
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
