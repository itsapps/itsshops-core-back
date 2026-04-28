/* eslint-disable @typescript-eslint/naming-convention, camelcase */
export default {
  constants: {
    bottleVolume: {
      '100': 'Tenth Litre',
      '187': 'Quarter Litre-Split',
      '200': 'Piccolo',
      '250': 'Quarter Litre',
      '375': 'Half Bottle',
      '500': 'Half Litre',
      '750': 'Standard Bottle',
      '1000': 'Litre',
      '1500': 'Magnum',
      '2000': 'Double Litre',
      '2250': 'Marie-Jeanne',
      '3000': 'Double Magnum',
      '4500': 'Rehoboam',
      '5000': 'Jeroboam',
      '6000': 'Imperial / Methuselah',
      '9000': 'Salmanazar',
      '12000': 'Balthazar',
      '15000': 'Nebuchadnezzar',
    },
  },
  global: {
    linkTypes: {
      internal: 'Internal Link',
      external: 'External Link',
      submenu: 'Submenu',
    },
  },
  groups: {
    product: 'Product',
    description: 'Description',
    stock: 'Stock',
    pricing: 'Pricing',
    media: 'Media',
    seo: 'SEO',
    filters: 'Product Filters',
    variants: 'Variants',
    wine: 'Wine',
    variant: 'Variant',
    bundle: 'Bundles',
    general: 'General',
    address: 'Address',
    vinofact: 'Vinofact',
    content: 'Content',
    images: 'Images',
    settings: 'Settings',
    vat: 'VAT',
    order: 'Order',
    orderPayment: 'Payment',
    orderItems: 'Items',
    orderCustomer: 'Customer',
    orderTotals: 'Totals',
    orderVouchers: 'Vouchers',
    orderCoupons: 'Coupons',
    orderFreeProducts: 'Gifts',
    infos: 'Information',
  },
  fieldsets: {},
  fields: {
    kind: {
      title: 'Product Kind',
      options: {
        wine: 'Wine',
        physical: 'Physical',
        digital: 'Digital',
        bundle: 'Bundle',
      },
    },
    disabled: {
      title: 'Inactive',
    },
    internalLinkTitle: {
      title: 'Title',
    },
    internalLinkReference: {
      title: 'Reference',
    },
    externalLinkTitle: {
      title: 'Title',
    },
    externalLinkUrl: {
      title: 'Link',
      description:
        'For emails use "mailto:hello@example.com", for phone numbers use "tel:+4365012345678"',
    },
    externalLinkBlank: {
      title: 'Open in new window',
    },
    url: {
      title: 'URL',
    },
    internalLinkDisplayType: {
      title: 'Display type',
      options: {
        link: 'Link',
        button: 'Button',
        ghost: 'Ghost',
      },
    },
    locale: {
      title: 'Language',
    },
    contactEmail: {
      title: 'Contact email',
    },
    email: {
      title: 'Email',
    },
    supabaseId: {
      title: 'External user ID (Supabase)',
    },
    prename: {
      title: 'First name',
    },
    lastname: {
      title: 'Last name',
    },
    phone: {
      title: 'Phone',
    },
    line1: {
      title: 'Address line 1',
    },
    line2: {
      title: 'Address line 2',
    },
    city: {
      title: 'City',
    },
    zip: {
      title: 'Postal code',
    },
    country: {
      title: 'Country',
    },
    state: {
      title: 'State',
    },
    countries: {
      title: 'Countries',
    },
    address: {
      title: 'Address',
    },
    enabled: {
      title: 'Enabled',
    },
    countryCode: {
      title: 'Country',
    },
    freeShippingThreshold: {
      title: 'Free shipping',
      description: 'Orders with a value above this gross amount qualify for free shipping.',
    },
    freeShippingCalculation: {
      title: 'Free shipping calculation',
      description: 'Should free shipping be calculated before or after the discount?',
    },
    title: {
      title: 'Title',
    },
    description: {
      title: 'Description',
    },
    image: {
      title: 'Image',
    },
    alt: {
      title: 'Alternative text',
    },
    slug: {
      title: 'URL name',
      validation: 'Allowed characters: "a-z" "A-Z" "0-9" "-" "_"',
    },
    modules: {
      title: 'Content',
    },
    sku: {
      title: 'SKU',
    },
    weight: {
      title: 'Weight (g)',
    },
    taxCategory: {
      title: 'Tax category',
    },
    manufacturers: {
      title: 'Manufacturers',
    },
    categories: {
      title: 'Categories',
    },
    tags: {
      title: 'Tags',
    },
    seo: {
      title: 'SEO',
    },
    stock: {
      title: 'Stock',
    },
    stockThreshold: {
      title: 'Lower stock notification threshold',
      description:
        'Receive a notification when the stock level of the product drops below this threshold.',
    },
    compareAtPrice: {
      title: 'Compare-at price',
    },
    price: {
      title: 'Price',
    },
    images: {
      title: 'Images',
    },
    vinofactWineId: {
      title: 'Wine',
      description: 'Links this product to a Vinofact wine',
    },
    content: {
      title: 'Content',
    },
    paymentIntentId: {
      title: 'Stripe Payment Intent ID',
    },
    totals: {
      title: 'Totals',
    },
    customer: {
      title: 'Customer',
    },
    orderItems: {
      title: 'Items',
    },
    billingAddress: {
      title: 'Billing address',
    },
    shippingAddress: {
      title: 'Shipping address',
    },
    vouchers: {
      title: 'Vouchers',
    },
    appliedCoupons: {
      title: 'Redeemed coupons',
    },
    freeProducts: {
      title: 'Gifts',
    },
  },
  block: {
    styles: {
      normal: 'Normal',
      h1: 'Heading 1',
      h2: 'Heading 2',
      h3: 'Heading 3',
      h4: 'Heading 4',
      h5: 'Heading 5',
      h6: 'Heading 6',
    },
    marks: {
      decorators: {
        strong: 'Bold',
        em: 'Italic',
        underline: 'Underline',
        'strike-through': 'Strikethrough',
        code: 'Code',
        internalLink: 'Internal link',
        externalLink: 'External link',
        highlight: 'Highlight',
      },
      annotations: {
        underline: 'Underline',
        strikethrough: 'Strikethrough',
        code: 'Code',
        link: 'Link',
        highlight: 'Highlight',
        internalLink: 'Internal link',
        externalLink: 'External link',
      },
    },
  },
  orderings: {
    asc: 'Ascending',
    desc: 'Descending',
  },
  validation: {
    assetRequired: 'Image is required',
    maxLength: 'Value must not contain more than {{max}} characters',
    minLength: 'Value must contain at least {{min}} characters',
    oneFieldMustExist: 'At least one is required',
    requiredField: 'Required',
    deliveryMethodsAtLeastOneRate: 'At least one rule must be defined.',
    menuMaxDepthExceeded: 'Menus can have at most {{maxDepth}} levels.',
    countryCodeNoDuplicates: 'A configuration for {{countryCode}} already exists.',
    duplicateVolume: 'Each volume may only appear once.',
  },

  productFieldsets: {
    states: 'States',
  },
  product: {
    title: 'Product',
    fields: {
      variants: {
        title: 'Product variants',
        description: 'All variants generated from product options',
      },
      weight: {
        title: 'Weight',
        description: 'Weight in grams. Used when a variant has no weight set.',
      },
    },
    preview: {
      variants_one: '{{count}} variant',
      variants_other: '{{count}} variants',
    },
  },
  productGrid: {
    title: 'Product Grid',
    fields: {
      title: { title: 'Title' },
      products: { title: 'Products' },
    },
  },
  productList: {
    title: 'Product List',
    fields: {
      title: { title: 'Title' },
      filters: { title: 'Filters' },
      products: { title: 'Products' },
    },
    wineFieldFilter: {
      title: 'Wine filter',
      fields: {
        field: {
          title: 'Field',
          options: {
            vintage: 'Vintage',
            varietal: 'Varietal',
            color: 'Color',
            classification: 'Classification',
            volume: 'Bottle size',
          },
        },
      },
    },
    productFieldFilter: {
      title: 'Product filter',
      fields: {
        field: {
          title: 'Field',
          options: {
            price: 'Price',
            category: 'Category',
          },
        },
      },
    },
    preview: {
      filter: 'Filter',
      filters_zero: 'No filters',
      filters_one: '{{count}} filter',
      filters_other: '{{count}} filters',
      product: 'Product',
      products_zero: 'No products',
      products_one: '{{count}} product',
      products_other: '{{count}} products',
    },
  },
  productVariant: {
    title: 'Product variant',
    fields: {
      coverImage: {
        title: 'Cover image',
        description:
          'Choose the cover image for this variant. Has no effect if the variant uses its own images.',
      },
      options: {
        title: 'Options',
      },
      product: {
        title: 'Product',
      },
      bundleItems: {
        title: 'Bundle products',
      },
      volume: {
        title: 'Volume',
      },
      vintage: {
        title: 'Vintage',
      },
      wine: {
        title: 'Wine',
      },
      weight: {
        title: 'Weight',
        description: 'Weight in grams. If set, used instead of the product weight.',
      },
      status: {
        title: 'Status',
        options: {
          active: '🟢 Active',
          comingSoon: '🟡 Coming soon/Teaser',
          soldOut: '🔴 Sold out (Visible)',
          archived: '⚪ Archived',
        },
      },
    },
    preview: {
      variants: 'Variants',
      bundleItems_zero: 'No products',
      bundleItems_one: '{{count}} product',
      bundleItems_other: '{{count}} products',
    },
  },
  wine: {
    title: 'Wine',
    fields: {
      vinofactWineId: {
        title: 'Vinofact wine',
        description: 'Links this product to a Vinofact wine',
      },
      volume: {
        title: 'Volume',
      },
      vintage: {
        title: 'Vintage',
      },
    },
  },
  bundleItem: {
    title: 'Product',
    fields: {
      quantity: {
        title: 'Quantity',
      },
      product: {
        title: 'Product',
      },
    },
    preview: {
      quantity_zero: 'No products',
      quantity_one: '{{count}} product',
      items_other: '{{count}} products',
    },
  },
  category: {
    title: 'Category',
    fields: {
      parent: {
        title: 'Parent category',
      },
      filters: { title: 'Filters' },
    },
  },
  manufacturer: {
    title: 'Manufacturer',
    fields: {
      link: {
        title: 'Link',
      },
    },
  },
  textBlock: {
    title: 'Text block',
    fields: {
      content: {
        title: 'Content',
      },
      content2: {
        title: 'Content 2',
        block: {
          styles: {},
        },
      },
    },
  },
  shippingMethod: {
    title: 'Shipping method',
    fields: {
      rates: {
        title: 'Rate table (weight)',
      },
      methodType: {
        title: 'Type',
        options: {
          delivery: 'Delivery',
          pickup: 'Pickup',
        },
      },
      packagingConfigs: {
        title: 'Wine packaging',
      },
      pickupFee: {
        title: 'Pickup fee',
        description: 'Set to 0 to make pickup free of charge.',
      },
      eligibleCountries: {
        title: 'Countries',
      },
    },
    preview: {
      countries_zero: 'No countries selected',
      countries_one: '{{count}} country',
      countries_other: '{{count}} countries',
    },
  },
  winePackage: {
    title: 'Package',
    fields: {
      count: { title: 'Bottles per package' },
      price: { title: 'Price', description: 'Gross price' },
    },
  },
  winePackagingConfig: {
    title: 'Volume configuration',
    fields: {
      volume: { title: 'Bottle size' },
      packages: { title: 'Packages' },
    },
  },
  shippingRate: {
    title: 'Cost',
    fields: {
      price: {
        description: 'Gross price',
      },
      maxWeight: {
        title: 'Maximum weight',
        description: 'Up to weight (kg)',
      },
    },
  },
  taxCountry: {
    title: 'Country',
    fields: {
      rules: {
        title: 'Tax rates',
      },
      freeShippingCalculation: {
        options: {
          beforeDiscount: 'Before discount',
          afterDiscount: 'After discount',
        },
      },
    },
    preview: {
      rules_zero: 'No tax rates selected',
      rules_one: '{{count}} tax rate',
      rules_other: '{{count}} tax rates',
    },
  },
  shopSettings: {
    title: 'General shop settings',
    fields: {
      filters: { title: 'Global filters' },
      defaultCountry: {
        title: 'Default country',
        description: 'Which country should be used by default at checkout?',
      },
      defaultTaxCategory: {
        title: 'Default tax category',
        description: 'If a product has no tax category, this one is used.',
      },
      freeShippingCalculation: {
        options: {
          beforeDiscount: 'Before discount',
          afterDiscount: 'After discount',
        },
      },
      stockThreshold: {
        title: 'Global lower stock notification threshold',
        description: "Receive a notification when a product's stock drops below this threshold.",
      },
      billingAddress: {
        title: 'Billing address',
        description: 'If different from the company address',
      },
      bankAccount: {
        title: 'Bank details',
        description: 'Used on invoices',
      },
      senderName: {
        title: 'Sender name',
        description: 'Used as the sender for order and shipping emails to customers',
      },
      senderEmail: {
        title: 'Sender email',
        description: 'Used as the sender address for order and shipping emails to customers',
      },
      orderNumberPrefix: {
        title: 'Order number prefix',
        description: 'Used as a prefix for the order number, e.g. "ORD-00000001"',
      },
      invoiceNumberPrefix: {
        title: 'Invoice number prefix',
        description: 'Used as a prefix for the invoice number, e.g. "INV-00000001"',
      },
      lastInvoiceNumber: {
        title: 'Last invoice number',
        description:
          'Caution! This value is incremented automatically and should not be changed manually.',
      },
      shopPage: {
        title: 'Shop page',
        description: 'This page is used as the main page of the shop.',
      },
    },
    groups: {
      displays: 'Displays',
      shipping: 'Shipping',
      stock: 'Stock',
      tax: 'Tax',
      orders: 'Orders',
      billing: 'Billing',
      notifications: 'Notifications',
    },
    preview: {},
  },
  bankAccount: {
    title: 'Bank',
    fields: {
      name: {
        title: 'Bank name',
      },
      iban: {
        title: 'IBAN',
      },
      bic: {
        title: 'BIC',
      },
    },
  },
  company: {
    title: 'Organization',
    fields: {
      name: {
        title: 'Company name',
      },
      owner: {
        title: 'Company owner',
      },
      address: {
        title: 'Address',
      },
      email: {
        title: 'Email',
      },
      phone: {
        title: 'Phone',
      },
      vatId: {
        title: 'VAT ID',
      },
    },
  },
  taxRule: {
    title: 'Rule',
    fields: {
      rate: {
        title: 'Tax rate in %',
      },
    },
    preview: {
      rate: ' Tax rate',
    },
  },
  taxCategory: {
    title: 'Tax category',
    fields: {
      title: {
        description: 'Name of the category (e.g. "Standard, Alcohol, ...")',
      },
      code: {
        title: 'Code',
        description: 'The code is used to identify the tax category.',
      },
    },
    preview: {},
  },
  address: {
    title: 'Address',
    fields: {},
  },
  addressStrict: {
    title: 'Address',
    fields: {
      name: {
        title: 'Full name',
      },
    },
  },
  businessAddress: {
    title: 'Address',
    fields: {},
  },
  orderTotals: {
    title: 'Totals',
    fieldsets: {
      vat: 'VAT',
    },
    fields: {
      grandTotal: {
        title: 'Grand total (gross)',
        description: 'The final amount the customer paid',
      },
      subtotal: {
        title: 'Subtotal',
        description: 'Sum of all order items (gross)',
      },
      shipping: {
        title: 'Shipping cost',
      },
      discount: {
        title: 'Discount',
      },
      totalVat: {
        title: 'Total VAT',
        description: 'Sum of all VAT from items and shipping',
      },
      vatBreakdown: {
        title: 'VAT breakdown',
        description: 'VAT grouped by rate (e.g. 10% vs 20%)',
      },
      currency: {
        title: 'Currency',
      },
    },
  },
  order: {
    title: 'Order',
    groups: {
      order: 'Order',
      history: 'Status history',
      orderPayment: 'Payment',
      orderItems: 'Items',
      orderCustomer: 'Customer',
      orderTotals: 'Totals',
      fulfillment: 'Fulfillment',
      orderVouchers: 'Vouchers',
      orderCoupons: 'Coupons',
      orderFreeProducts: 'Gifts',
    },
    fields: {
      orderNumber: {
        title: 'Order number',
      },
      invoiceNumber: {
        title: 'Invoice number',
      },
      status: {
        title: 'Status',
        options: {
          created: 'Created',
          processing: 'Processing',
          shipped: 'Shipped',
          delivered: 'Delivered',
          canceled: 'Canceled',
          returned: 'Returned',
        },
      },
      paymentStatus: {
        title: 'Payment status',
        options: {
          succeeded: 'Paid',
          refunded: 'Refunded',
          partiallyRefunded: 'Partially refunded',
        },
      },
      statusHistory: {
        title: 'Status history',
      },
      paymentIntentId: {
        title: 'Stripe Payment Intent ID',
      },
      orderItems: {
        title: 'Items',
      },
      customer: {
        title: 'Customer',
      },
      totals: {
        title: 'Totals',
      },
      fulfillment: {
        title: 'Fulfillment',
      },
    },
  },
  orderStatusHistory: {
    title: 'Status history',
    fields: {
      type: {
        title: 'Type',
        options: {
          payment: 'Payment',
          fulfillment: 'Fulfillment',
        },
      },
      status: {
        title: 'Status',
      },
      timestamp: {
        title: 'Date',
      },
      source: {
        title: 'Source',
      },
      note: {
        title: 'Note',
      },
    },
  },
  orderCustomer: {
    title: 'Customer',
    groups: {
      general: 'General',
      billing: 'Billing address',
      shipping: 'Shipping address',
    },
    fields: {
      locale: {
        title: 'Language',
      },
      contactEmail: {
        title: 'Contact email',
      },
      supabaseId: {
        title: 'Supabase user ID',
      },
      billingAddress: {
        title: 'Billing address',
      },
      shippingAddress: {
        title: 'Shipping address',
      },
    },
  },
  orderItem: {
    title: 'Order item',
    fields: {
      kind: {
        title: 'Kind',
      },
      variantId: {
        title: 'Variant ID',
      },
      productId: {
        title: 'Product ID',
      },
      parentId: {
        title: 'Parent item key',
        description: "Set on bundle child items — points to the parent bundle's orderItem._key",
      },
      title: {
        title: 'Product title',
        description: 'Snapshotted product title at the time of order',
      },
      variantTitle: {
        title: 'Variant title',
        description: 'Snapshotted variant title at the time of order',
      },
      displayTitle: {
        title: 'Display title',
        description:
          'Frozen display string the customer saw at order time — canonical for invoices, emails, customer order history, WC API. Never recompose.',
      },
      displaySubtitle: {
        title: 'Display subtitle',
        description: 'Frozen subtitle the customer saw at order time (optional).',
      },
      weight: {
        title: 'Weight',
        description: 'Weight in grams at the time of order',
      },
      sku: {
        title: 'SKU',
      },
      quantity: {
        title: 'Quantity',
      },
      price: {
        title: 'Unit price',
        description: 'Unit price in cents',
      },
      vatRate: {
        title: 'VAT rate',
        description: 'VAT rate as a percentage, e.g. 20 for 20%',
      },
      vatAmount: {
        title: 'VAT amount',
        description: 'Total VAT for this line in cents (quantity × unit vat)',
      },
      packed: {
        title: 'Packed',
      },
      wine: {
        title: 'Wine details',
      },
      options: {
        title: 'Options',
        description: 'Snapshotted option group/value pairs',
      },
      bundle: {
        title: 'Bundle',
      },
    },
  },
  orderItemWine: {
    title: 'Wine',
    fields: {
      vintage: {
        title: 'Vintage',
      },
      volume: {
        title: 'Volume',
        description: 'Volume in ml',
      },
    },
  },
  orderItemBundle: {
    title: 'Bundle',
    fields: {
      itemCount: {
        title: 'Item count',
        description: 'Total quantity of all child items combined',
      },
    },
  },
  orderItemOption: {
    title: 'Option',
    fields: {
      groupTitle: {
        title: 'Group',
      },
      optionTitle: {
        title: 'Option',
      },
    },
  },
  fulfillment: {
    title: 'Fulfillment',
    fields: {
      methodTitle: {
        title: 'Shipping method',
        description: 'Snapshotted title (e.g. "DHL Express" or "Self-pickup")',
      },
      methodType: {
        title: 'Type',
        options: {
          delivery: 'Delivery',
          pickup: 'Pickup',
        },
      },
      shippingCost: {
        title: 'Shipping cost',
        description: 'The fee charged to the customer',
      },
      taxSnapshot: {
        title: 'Shipping tax',
      },
      method: {
        title: 'Shipping method reference',
        description: 'Link to the original config (may change over time)',
      },
      trackingCode: {
        title: 'Tracking code',
      },
      pickupLocation: {
        title: 'Pickup location',
        description: 'The address where the customer will collect the goods',
      },
    },
  },
  vatBreakdownItem: {
    title: 'VAT breakdown',
    fields: {
      rate: {
        title: 'Rate %',
      },
      net: {
        title: 'Net amount',
      },
      vat: {
        title: 'VAT amount',
      },
    },
  },
  tag: {
    title: 'Tag',
  },
  customer: {
    title: 'Customer',
    fields: {
      customerNumber: {
        title: 'Customer number',
      },
      customerGroups: {
        title: 'Customer groups',
      },
      receiveNewsletter: {
        title: 'Newsletter',
      },
      status: {
        title: 'Registration status',
        options: {
          registered: 'Registered',
          invited: 'Invited',
          active: 'Active',
        },
      },
      locale: {
        title: 'Language',
      },
    },
  },
  variantOptionGroup: {
    title: 'Option group',
    fields: {
      sortOrder: {
        title: 'Sort order',
        description: 'The lower the number, the earlier the option appears.',
      },
    },
  },
  variantOption: {
    title: 'Option',
    fields: {
      sortOrder: {
        title: 'Sort order',
        description: 'The lower the number, the earlier the option appears.',
      },
      group: {
        title: 'Option group',
      },
    },
  },
  page: {
    title: 'Page',
    groups: {
      page: 'General',
    },
  },
  post: {
    title: 'Blog post',
    groups: {
      post: 'General',
    },
    fields: {
      preview: {
        title: 'Preview',
      },
    },
  },
  blog: {
    title: 'Blog',
    groups: {
      blog: 'General',
    },
    fields: {
      postsPerPage: {
        title: 'Posts per page',
      },
    },
  },
  link: {
    title: 'Link',
    fields: {
      href: {
        title: 'URL',
        description:
          'For emails use "mailto:hello@example.com", for phone numbers use "tel:+4365012345678"',
      },
      displayType: {
        title: 'Display type',
        options: {
          text: 'Text',
          button: 'Button',
        },
      },
    },
  },
  internalLink: {
    title: 'Internal link',
    fields: {
      reference: {
        title: 'Reference',
      },
      displayType: {
        title: 'Display type',
        options: {
          link: 'Link',
          button: 'Button',
        },
      },
    },
  },
  action: {
    title: 'Action',
    fields: {
      title: {
        title: 'Text',
      },
      internalLink: {
        title: 'Link',
      },
    },
  },
  multiColumns: {
    title: 'Columns',
    preview: {
      columns: 'Column(s)',
    },
    fields: {
      headline: {
        title: 'Headline',
      },
      backgroundImage: {
        title: 'Background image',
      },
      columns: {
        title: 'Columns',
      },
    },
  },
  localeComplexPortable: {
    title: 'Content',
    preview: {
      noContent: 'No content',
      image: 'Image',
    },
    fields: {
      headline: {
        title: 'Headline',
      },
      backgroundImage: {
        title: 'Background image',
      },
      columns: {
        title: 'Columns',
      },
      translations: {
        title: 'Translations',
      },
    },
  },
  menu: {
    title: 'Menu',
    fields: {
      items: {
        title: 'Entries',
      },
    },
  },
  menuItem: {
    title: 'Menu entry',
    fields: {
      linkType: {
        title: 'Type',
        options: {
          internal: 'Internal link',
          external: 'External link',
          submenu: 'Submenu',
        },
      },
      children: {
        title: 'Entries',
      },
    },
    preview: {
      noUrl: 'No URL',
      noReference: 'No reference',
      submenuItems_zero: 'No entries',
      submenuItems_one: '{{count}} entry',
      submenuItems_other: '{{count}} entries',
    },
  },
  navPage: {
    title: 'Page',
    fields: {
      page: {
        title: 'Page',
      },
    },
  },
  navLink: {
    title: 'Link',
    fields: {
      url: {
        title: 'Url',
      },
    },
  },
  settings: {
    title: 'General settings',
    groups: {
      site: 'Website',
      displays: 'Displays',
      analytics: 'Analytics',
      company: 'Company',
    },
    fields: {
      siteTitle: {
        title: 'Site title',
        description:
          'The name of your site, usually your brand or company name. Used in the browser tab, social media previews, and the web app manifest.',
      },
      siteShortDescription: {
        title: 'Short description',
        description:
          'Used as the meta description in search results when no page-specific SEO description is set.',
      },
      defaultShareImage: {
        title: 'Default share image',
        description:
          'Used in social media previews (og:image) when neither a page-specific SEO image nor a page image is available. Recommended size: 1200×630px.',
      },
      homePage: {
        title: 'Home page',
        description: 'This page is shown as the home page',
      },
      privacyPage: {
        title: 'Privacy policy',
        description: 'This page contains the privacy policy',
      },
      mainMenus: {
        title: 'Main menus',
        description: 'These menus are shown in the main navigation',
      },
      footerMenus: {
        title: 'Footer menus',
        description: 'These menus are shown in the footer',
      },
      gtmId: {
        title: 'Google Tag Manager (GTM)',
        description: 'To enable GTM, enter your container ID',
      },
      company: {
        title: 'Company',
      },
    },
  },
  customerGroup: {
    title: 'Customer group',
  },
  coupon: {
    title: 'Coupon',
    fields: {
      code: {
        title: 'Code',
        description: 'Code customers enter at checkout.',
      },
      title: {
        title: 'Internal title',
      },
      description: {
        title: 'Internal note',
      },
      enabled: {
        title: 'Active',
      },
      discountType: {
        title: 'Discount type',
        options: {
          percent: 'Percent',
          fixed: 'Fixed amount',
          freeShipping: 'Free shipping',
        },
      },
      value: {
        title: 'Value',
        description: 'Percent: 1–100. Fixed: amount in cents (1000 = €10).',
      },
      validFrom: {
        title: 'Valid from',
      },
      validTo: {
        title: 'Valid until',
      },
      minSubtotal: {
        title: 'Minimum subtotal',
        description: 'Gross subtotal threshold to apply this coupon.',
      },
      maxRedemptions: {
        title: 'Max redemptions',
        description: 'Global cap. Leave empty for unlimited.',
      },
      redemptionCount: {
        title: 'Redemptions so far',
      },
    },
    validation: {
      valueRequired: 'Value is required',
      valuePositive: 'Value must be greater than 0',
      percentMax: 'Percent cannot exceed 100',
      validToAfterFrom: '"Valid until" must be after "valid from"',
      codeInUse: 'Code is already in use',
    },
    preview: {
      badge: {
        active: '🟢 Active',
        disabled: '⚪ Disabled',
        expired: '🔴 Expired',
        scheduled: '🟡 Scheduled',
        exhausted: '🔴 Exhausted',
      },
      freeShipping: 'Free shipping',
    },
  },
  appliedCoupon: {
    title: 'Redeemed coupon',
    fields: {
      couponRef: {
        title: 'Coupon',
      },
      code: {
        title: 'Code',
      },
      discountType: {
        title: 'Discount type',
        options: {
          percent: 'Percent',
          fixed: 'Fixed amount',
          freeShipping: 'Free shipping',
        },
      },
      value: {
        title: 'Value',
      },
      discountAmount: {
        title: 'Deducted amount',
        description: 'Amount actually deducted, in cents',
      },
    },
  },
  voucher: {
    title: 'Voucher',
    validation: {
      mustHaveDiscountOrReward: 'Vouchers must include a discount or a reward.',
    },
    fields: {
      active: {
        title: 'Active',
      },
      code: {
        title: 'Voucher code',
        description:
          'Code that must be entered by the user to redeem the voucher. If no code is used, the voucher is applied automatically.',
      },
      autoApply: {
        title: 'Auto apply',
        description: 'The voucher is applied automatically when all conditions are met.',
      },
      discountType: {
        title: 'Discount type',
        options: {
          none: 'None',
          fixed: 'Fixed amount',
          percentage: 'Percentage',
        },
      },
      discountFixed: {
        title: 'Amount',
        description: 'The voucher amount is subtracted from the cart.',
      },
      discountPercentage: {
        title: 'Percentage',
        description: 'The percentage is subtracted from the cart.',
      },
      stackable: {
        title: 'Stackable',
        description: 'Can be combined with other vouchers.',
      },
      validFrom: {
        title: 'Valid from',
      },
      validUntil: {
        title: 'Valid until',
      },
      customerGroups: {
        title: 'Customer groups',
        description: 'Restrict to specific customer groups.',
      },
      newCustomersOnly: {
        title: 'Only for new customers',
      },
      registeredCustomersOnly: {
        title: 'Only for registered customers',
      },
      conditions: {
        title: 'Conditions',
      },
      rewards: {
        title: 'Rewards',
        product: {
          title: 'Product',
        },
        quantity: {
          title: 'Quantity',
        },
      },
    },
  },
  voucherCondition: {
    title: 'Voucher condition',
    fields: {
      type: {
        title: 'Condition type',
        options: {
          product: 'Specific product',
          category: 'Product category',
          totalValue: 'Minimum cart value',
          quantity: 'Minimum quantity',
          userStatus: 'Customer status',
        },
      },
      product: {
        title: 'Product',
      },
      category: {
        title: 'Category',
      },
      minValue: {
        title: 'Minimum cart value',
      },
      minQuantity: {
        title: 'Minimum quantity',
      },
      userStatus: {
        title: 'Customer status',
        options: {
          registeredCustomer: 'Registered customer',
          newCustomer: 'New customer',
        },
      },
      messages: {
        productRequired: 'A product must be selected',
        categoryRequired: 'A category must be selected',
        minValueRequired: 'The minimum value must be set',
        quantityRequired: 'The minimum quantity must be set',
        userStatusRequired: 'The customer status must be selected',
      },
    },
  },
  seo: {
    title: 'SEO',
    fields: {
      metaTitle: {
        title: 'Meta title',
        description: 'Title for search engines and browsers',
        validation: 'Titles longer than 50 are truncated by search engines and browsers',
      },
      metaDescription: {
        title: 'Meta description',
        description: 'Description for search engines',
        validation: 'Descriptions longer than 150 are truncated by search engines',
      },
      shareTitle: {
        title: 'Share title',
        description: 'Title for social networks. If empty, the meta title is used',
        validation: 'Titles longer than 50 are truncated by social networks',
      },
      shareDescription: {
        title: 'Share description',
        description: 'Description for social networks. If empty, the meta description is used',
        validation: 'Descriptions longer than 150 are truncated by social networks',
      },
      shareImage: {
        title: 'Share image',
        description: 'Recommended size: 1200x630px (PNG or JPG)',
      },
      keywords: {
        title: 'Keywords',
      },
    },
  },
  youtube: {
    title: 'YouTube',
    fields: {
      url: {
        title: 'Url',
        description: 'YouTube video URL or ID',
      },
      showControls: {
        title: 'Show controls',
      },
      start: {
        title: 'Start at',
        description: 'Start the video at a specific time (in seconds)',
      },
      autoload: {
        title: 'Autoload',
        description: 'Load the video automatically when it becomes visible',
      },
      autopause: {
        title: 'Autopause',
        description: 'Pause the video automatically when it is no longer visible',
      },
    },
  },
  productSection: {
    title: 'Products',
    preview: {
      products: 'Product(s)',
      categories: 'Category(ies)',
    },
    fields: {
      headline: {
        title: 'Headline',
      },
      categories: {
        title: 'Categories',
        validation: {
          atLeastOneCategoryRequired: 'At least one category must be selected',
        },
      },
      totalProducts: {
        title: 'Count',
        description: 'Number of products to show',
        validation: {
          numProducts: 'At least one and up to 50 products can be shown',
        },
      },
    },
  },
  categorySection: {
    title: 'Category list',
    preview: {
      allCategories: 'All main categories',
    },
    fields: {
      headline: {
        title: 'Headline',
      },
      category: {
        title: 'Category',
        description: 'If no category is selected, all main categories will be shown.',
      },
    },
  },
  categoryGrid: {
    title: 'Category Grid',
    fields: {
      title: { title: 'Title' },
      categories: { title: 'Categories' },
    },
    preview: {
      categories_zero: 'No categories',
      categories_one: '{{count}} category',
      categories_other: '{{count}} categories',
    },
  },
  carousel: {
    title: 'Carousel',
    preview: {
      slides_zero: 'No images',
      slides_one: '{{count}} image',
      slides_other: '{{count}} images',
    },
    fields: {
      slides: {
        title: 'Images',
      },
      autoplay: {
        title: 'Autoplay',
      },
      autoplayDelay: {
        title: 'Autoplay delay',
        description: 'The next image is shown after the given seconds.',
      },
      loop: {
        title: 'Loop',
      },
      fade: {
        title: 'Fade',
        description: 'Fade animations instead of motion when switching slides.',
      },
    },
  },

  localeBlock: {
    title: 'Localized block',
    translations: {
      title: 'Translations',
    },
  },
  localeImage: {
    title: 'Image (multilingual)',
  },
  localeAltImage: {
    title: 'Image',
  },
  baseImage: {
    title: 'Image',
  },
  localeString: {
    title: 'Localized string',
    translations: {
      title: 'Translations',
    },
    validations: {
      allExist: 'All localizations must exist.',
    },
  },
  localeSlug: {
    title: 'Localized URL name',
    translations: {
      title: 'Translations',
    },
  },
}
