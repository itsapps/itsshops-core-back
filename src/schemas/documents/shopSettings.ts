import type { ComponentType } from 'react'
import { FieldDefinition } from 'sanity'
import {
  NoteIcon,
  OrderIcon,
  PackageIcon,
  TruckIcon,
  VatBreakdownIcon,
  WebsiteIcon,
  OrderWithdrawalIcon,
} from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'
import { requiredSubfields } from '../../utils/validation'

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
        // Checkout hides the terms / withdrawal confirmations when these are unset.
        f('termsPage', 'reference', {
          to: [{ type: 'page' }],
          validation: (rule) => rule.required(),
        }),
        f('withdrawalPolicyPage', 'reference', {
          to: [{ type: 'page' }],
          validation: (rule) => rule.required(),
        }),
        // "Versand & Zahlung" page (shippingInfoModule) — linked at the start of the checkout and
        // above the order button (FAGG §8 (3)).
        f('shippingInfoPage', 'reference', {
          to: [{ type: 'page' }],
        }),
        ...builders.filterField(),
      ],
      shipping: [
        // Checkout falls back to 'AT' when unset.
        f('defaultCountry', 'reference', {
          to: [{ type: 'taxCountry' }],
          validation: (rule) => rule.required().warning(),
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
        // Without it, products lacking a tax category are charged 0 % VAT.
        f('defaultTaxCategory', 'reference', {
          to: [{ type: 'taxCategory' }],
          validation: (rule) => rule.required(),
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
      billing: [
        // Seller address on the invoice + mail footer; fallback return address.
        f('billingAddress', 'businessAddress', {
          validation: requiredSubfields(['line1', 'zip', 'city', 'country'], ctx.t.default),
        }),
        f('bankAccount', 'bankAccount'),
      ],
      returns: [
        f('returnAddress', 'businessAddress'),
        f('returnShippingBorneBy', 'string', {
          options: {
            list: [{ value: 'customer' }, { value: 'merchant' }],
            layout: 'radio',
          },
          initialValue: 'customer',
          // Legal choice (withdrawal instructions + mails) — must be set explicitly.
          validation: (rule) => rule.required(),
        }),
        // Shown in the generated withdrawal instructions (page + order mail) and the withdrawal
        // confirmation mail — as a separate note, never spliced into the statutory text.
        f('returnPolicyNote', 'i18nText'),
        // When the withdrawal period starts — FAGG Anhang I note [1] b–e. Default: several items
        // of one order may arrive separately (cases ship as several parcels).
        f('withdrawalPeriodStart', 'string', {
          options: {
            list: [
              { value: 'goods' },
              { value: 'multipleGoods' },
              { value: 'partialDeliveries' },
              { value: 'subscription' },
            ],
            layout: 'radio',
          },
          initialValue: 'multipleGoods',
          validation: (rule) => rule.required(),
        }),
        // Statutory exceptions (§ 18 Abs. 1 FAGG) that apply to this shop's goods — listed next
        // to the withdrawal instructions.
        f('withdrawalExceptions', 'array', {
          of: [{ type: 'string' }],
          options: {
            list: [
              { value: 'customMade' },
              { value: 'perishable' },
              { value: 'sealedHygiene' },
              { value: 'mixed' },
              { value: 'alcoholMarketPrice' },
              { value: 'sealedMedia' },
              { value: 'newspapers' },
            ],
          },
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
