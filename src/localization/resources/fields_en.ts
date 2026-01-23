const productAndVariantFields = {
  title: {
    title: 'Title',
  },
  productNumber: {
    title: 'Product Number',
  },
  manufacturer: {
    title: 'Manufacturer',
  },
  categories: {
    title: 'Categories',
  },
  tags: {
    title: 'Tags',
  },
  stock: {
    title: 'Stock',
  },
  stockThreshold: {
    title: 'Product Stock Level Notification Threshold',
    description: 'Receive a notification when the stock level of the product is below this threshold.',
  },
  compareAtPrice: {
    title: 'Compare At Price',
  },
  price: {
    title: 'Price',
  },
  images: {
    title: 'Images',
  },
  description: {
    title: 'Description',
  },
}

export default {
  productGroups: {
    product: 'Product',
    description: 'Description',
    pricing: 'Pricing',
    media: 'Media',
    seo: 'SEO',
    variants: 'Variants'
  },
  productFieldsets: {
    states: 'States',
  },
  product: {
    title: 'Product',
    fields: {
      variants: {
        title: 'Product Variants',
        description: 'All variants generated from product options'
      },
      ...productAndVariantFields
    }
  },
  productVariant: {
    title: 'Product Variant',
    fields: {
      ...productAndVariantFields,
      coverImage: {
        title: 'Cover Image',
        description: "Select the cover image for this variant. Has no effect if the variant uses it's own images."
      },
      options: {
        title: 'Options',
      },
      active: {
        title: 'Active',
      },
      featured: {
        title: 'Featured',
        description: 'If checked, this variant will be displayed in the search. If no variant is featured, the first will automatically be used.',
      },
    },
    preview: {
      variants: "Variants"
    },
  },
  category: {
    schemaTitle: 'Categorie',
    title: {
      title: 'Title',
    },
    description: {
      title: 'Description',
    },
    parent: {
      title: 'Parent Category',
    },
    sortOrder: {
      title: 'Sort Order',
      description: 'The lower the number, the higher the category in the navigation',
    },
    image: {
      title: 'Image',
    },
  },
  manufacturer: {
    schemaTitle: 'Manufacturer',
    title: {
      title: 'Title',
    },
    description: {
      title: 'Description',
    },
    image: {
      title: 'Image',
    },
    link: {
      title: 'Link',
    },
  },
  address: {
    schemaTitle: 'Address',
    name: {
      title: 'Name',
    },
    prename: {
      title: 'Prename',
    },
    lastname: {
      title: 'Lastname',
    },
    phone: {
      title: 'Phone',
    },
    line1: {
      title: 'Address Line 1',
    },
    line2: {
      title: 'Address Line 2',
    },
    city: {
      title: 'City',
    },
    zip: {
      title: 'Zip',
    },
    country: {
      title: 'Country',
    },
    state: {
      title: 'State',
    },
  },
  shipping: {
    fieldsets: {
      rate: 'Shippingtype',
    },
    rateId: {
      title: 'Shipping ID',
    },
    rateTitle: {
      title: 'Title',
    },
    rateCost: {
      title: 'Shipping Cost',
    },
  },
  orderTotals: {
    schemaTitle: 'Order Totals',
    fieldsets: {
      vat: 'VAT',
    },
    subtotal: {
      title: 'Subtotal',
    },
    total: {
      title: 'Total',
    },
    vat: {
      title: 'Included VAT in subtotal',
    },
    vatRate: {
      title: 'VAT Rate',
      placeholder: '20',
    },
    currency: {
      title: 'Currency',
    },
    discount: {
      title: 'Discount',
    },
  },
  order: {
    schemaTitle: 'Order',
    groups: {
      order: 'Order',
      customer: 'Customer data',
      totals: 'Totals',
      vouchers: 'Vouchers',
    },
    total: {
      title: 'Total Price',
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
      title: 'Payment Status',
      options: {
        succeeded: 'Successfully paid',
        refunded: 'Refunded',
        partiallyRefunded: 'Partially refunded',
      },
    },
    statusHistory: {
      name: 'Status History',
      type: {
        title: 'Type',
        options: {
          payment: 'Payment',
          fulfillment: 'Fulfillment',
        }
      },
      state: {
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
    contactEmail: {
      title: 'Contact-Email',
    },
    shipping: {
      title: 'Shipping',
    },
    billingAddress: {
      title: 'Billing Address',
    },
    trackingNumber: {
      title: 'Tracking Number',
    },
    orderNumber: {
      title: 'Order Number',
    },
    invoiceNumber: {
      title: 'Invoice Number',
    },
    vouchers: {
      title: 'Vouchers',
    },
    freeProducts: {
      title: 'Gifts',
    },
    locale: {
      title: 'Language',
    },
  },
  tag: {
    schemaTitle: 'Tag',
    title: {
      title: 'Title',
    },
  },
  user: {
    schemaTitle: 'Customer',
    customerNumber: {
      title: 'Customer Number',
    },
    customerGroups: {
      title: 'Customer Groups',
    },
    prename: {
      title: 'Prename',
    },
    lastname: {
      title: 'Lastname',
    },
    email: {
      title: 'Email',
    },
    street: {
      title: 'Street',
    },
    city: {
      title: 'City',
    },
    zip: {
      title: 'Zip',
    },
    country: {
      title: 'Country',
    },
    phone: {
      title: 'Phone',
    },
    receiveNewsletter: {
      title: 'Newsletter',
    },
    externalUserId: {
      title: 'Supabase User ID',
    },
    portal: {
      title: 'Portal',
    },
    status: {
      title: 'Registration Status',
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
  variantOptionGroup: {
    schemaTitle: 'Option Group',
    title: {
      title: 'Title',
    },
    description: {
      title: 'Description',
    },
    options: {
      title: 'Options',
    },
    sortOrder: {
      title: 'Sort Order',
      description: 'The lower the number, the higher the sort order',
    },
  },
  variantOption: {
    schemaTitle: 'Option',
    title: {
      title: 'Title',
    },
    image: {
      title: 'Image',
    },
    sortOrder: {
      title: 'Sort Order',
      description: 'The lower the number, the higher the sort order',
    },
  },
  page: {
    schemaTitle: 'Page',
    groups: {
      page: 'General',
      seo: 'SEO',
      content: 'Content',
    },
    title: {
      title: 'Title',
    },
    slug: {
      title: 'URL-Name',
      validation: 'Allowed characters: "a-z" "A-Z" "0-9" "-"',
    },
    modules: {
      title: 'Content',
    },
  },
  post: {
    schemaTitle: 'Blog Post',
    groups: {
      post: 'General',
      seo: 'SEO',
      content: 'Content',
    },
    title: {
      title: 'Title',
    },
    preview: {
      title: 'Preview',
    },
    slug: {
      title: 'URL-Name',
      validation: 'Allowed characters: "a-z" "A-Z" "0-9" "-"',
    },
    image: {
      title: 'Image',
    },
    modules: {
      title: 'Content',
    },
  },
  blog: {
    schemaTitle: 'Blog',
    groups: {
      blog: 'General',
      seo: 'SEO',
      settings: 'Settings',
    },
    title: {
      title: 'Title',
    },
    description: {
      title: 'Description',
    },
    postsPerPage: {
      title: 'Posts per Page',
    },
  },
  hero: {
    schemaTitle: 'Hero',
    headline: {
      title: 'Headline',
    },
    image: {
      title: 'Image',
    },
    backgroundImage: {
      title: 'Background Image',
    },
    actions: {
      title: 'Internal Links',
    },
  },
  link: {
    schemaTitle: 'Link',
    href: {
      title: 'URL',
      description: 'For Emails, use "mailto:hello@example.com", for Phone Numbers, use "tel:+4365012345678"',
    },
    displayType: {
      title: 'Display Type',
      options: {
        text: 'Text',
        button: 'Button',
      },
    },
  },
  internalLink: {
    schemaTitle: 'Internal Link',
    reference: {
      title: 'Reference',
    },
    displayType: {
      title: 'Display Type',
      options: {
        link: 'Link',
        button: 'Button',
      },
    },
  },
  action: {
    schemaTitle: 'Action',
    title: {
      title: 'Text',
    },
    internalLink: {
      title: 'Link',
    },
  },
  multiColumns: {
    schemaTitle: 'Multiple Columns',
    preview: {
      columns: 'Column(s)',
    },
    headline: {
      title: 'Headline',
    },
    backgroundImage: {
      title: 'Background Image',
    },
    columns: {
      title: 'Columns',
    },
  },
  localeComplexPortable: {
    schemaTitle: 'Content',
    preview: {
      noContent: 'No Content',
      image: 'Image',
    },
    headline: {
      title: 'Headline',
    },
    backgroundImage: {
      title: 'Background Image',
    },
    columns: {
      title: 'Columns',
    },
    translations: {
      title: 'Translations',
    },
  },
  complexPortableText: {
    schemaTitle: 'Content',
    decorators: {
      strong: 'Bold',
      emphasis: 'Emphasis',
      left: 'Align left',
      right: 'Align right',
      center: 'Align center',
    },
    annotations: {
      link: 'Link',
      internalLink: 'Internal Link',
    },
  },
  customImage: {
    schemaTitle: 'Image',
    title: {
      title: 'Title',
    },
    altText: {
      title: 'Alternative Text',
    },
  },
  menu: {
    schemaTitle: 'Menu',
    title: {
      title: 'Title',
    },
    items: {
      title: 'Entries',
    },
  },
  navPage: {
    schemaTitle: 'Page',
    title: {
      title: 'Title',
    },
    page: {
      title: 'Page',
    },
  },
  navLink: {
    schemaTitle: 'Link',
    title: {
      title: 'Title',
    },
    url: {
      title: 'Url',
    },
  },
  settings: {
    general: {
      schemaTitle: 'General Settings',
      groups: {
        siteDetails: 'Descriptions',
        company: 'Company',
        bank: 'Bankaccount',
        displays: 'Displays',
        advanced: 'Advanced',
      },
      siteTitle: {
        title: 'Site Title',
        description: 'The name of your site, usually your company/brand name',
      },
      siteDescription: {
        title: 'Description',
        description: 'The description of your site.',
      },
      siteShortDescription: {
        title: 'Short Description',
        description: 'A short description of your site.',
      },
      companyName: {
        title: 'Company Name',
      },
      companyOwner: {
        title: 'Company Owner',
      },
      companyPhone: {
        title: 'Phone',
      },
      companyStreet: {
        title: 'Street',
      },
      companyZip: {
        title: 'Zip',
      },
      companyCity: {
        title: 'City',
      },
      companyCountry: {
        title: 'Country',
      },
      companyState: {
        title: 'State',
      },
      companyEmail: {
        title: 'Email',
      },
      companyUID: {
        title: 'UID',
      },
      bankName: {
        title: 'Bank name',
      },
      bankIBAN: {
        title: 'IBAN',
      },
      bankBIC: {
        title: 'BIC',
      },
      orderNumberPrefix: {
        title: 'Order Number Prefix',
        description: 'Used as a prefix for the order number, e.g. "ORD-20250315-123456',
      },
      invoiceNumberPrefix: {
        title: 'Invoice Number Prefix',
        description: 'Used as a prefix for the invoice number, e.g. "INV-20250315-123456',
      },
      home: {
        title: 'Home Page',
        description: 'This page will show at the root of your domain',
      },
      privacy: {
        title: 'Privacy Policy',
        description: 'This page contains the privacy policy of your site',
      },
      mainMenus: {
        title: 'Main Menus',
        description: 'These menus will be displayed in the main navigation',
      },
      footerMenus: {
        title: 'Footer Menus',
        description: 'These menus will be displayed in the footer',
      },
      gtmID: {
        title: 'Google Tag Manager (GTM)',
        description: 'To enable GTM enter your Container ID',
      },
      stockThreshold: {
        title: 'Global Product Stock Notification Threshold',
        description: 'Receive a notification when a product is below this threshold.',
      },
      lastInvoiceNumber: {
        title: 'Last Invoice Number',
        description: 'Caution! This value is automatically incremented and should not be changed manually.',
      },
    },
  },
  customerGroup: {
    schemaTitle: 'Customer Group',
    title: {
      title: 'Title',
    }
  },
  voucher: {
    schemaTitle: 'Voucher',
    validation: {
      mustHaveDiscountOrReward: 'Vouchers must have a discount or a reward.',
    },
    title: {
      title: 'Title',
    },
    description: {
      title: 'Description',
    },
    active: {
      title: 'Active',
    },
    code: {
      title: 'Voucher Code',
      description: 'Code that must be entered by user to apply the voucher. If no code is used, the voucher will be applied automatically.',
    },
    autoApply: {
      title: 'Auto Apply',
      description: 'Voucher is applied automatically when all conditions match.',
    },
    discountType: {
      title: 'Discount Type',
      options: {
        none: 'None',
        fixed: 'Fixed Amount',
        percentage: 'Percentage',
      }
    },
    discountFixed: {
      title: 'Amount',
      description: 'Fixed amount to be subtracted from the total.',
    },
    discountPercentage: {
      title: 'Percentage',
      description: 'Percentage to be subtracted from the total.',
    },
    stackable: {
      title: 'Stackable',
      description: 'Can be used together with other vouchers.',
    },
    validFrom: {
      title: 'Valid From',
    },
    validUntil: {
      title: 'Valid Until',
    },
    customerGroups: {
      title: 'Customer Groups',
      description: 'Restrict to specific customer groups (optional).',
    },
    newCustomersOnly: {
      title: 'Only for New Customers',
    },
    registeredCustomersOnly: {
      title: 'Only for Registered Customers',
    },
    conditions: {
      title: 'Conditions',
    },
    rewards: {
      title: 'Rewards',
      description: 'Reward products when conditions are met.',
      product: {
        title: 'Product',
      },
      quantity: {
        title: 'Quantity',
      }
    }
  },
  voucherCondition: {
    schemaTitle: 'Voucher Condition',
    type: {
      title: 'Condition Type',
      options: {
        product: 'Specific Product',
        category: 'Product Category',
        totalValue: 'Minimum Cart Value',
        quantity: 'Minimum Quantity',
        userStatus: 'User Status',
      },
    },
    product: {
      title: 'Product',
    },
    category: {
      title: 'Category',
    },
    minValue: {
      title: 'Minimum Cart Value',
    },
    minQuantity: {
      title: 'Minimum Quantity',
    },
    userStatus: {
      title: 'Customer Status',
      options: {
        registeredCustomer: 'Registerd Customer',
        newCustomer: 'New Customer',
      }
    },
    messages: {
      productRequired: "A product is required",
      categoryRequired: "A category is required",
      minValueRequired: "The minimum value must be set",
      quantityRequired: "The minimum quantity must be set",
      userStatusRequired: "The customer status must be set",
    },
  },
  shippingCountry: {
    schemaTitle: 'Shipping Country',
    isDefault: {
      title: 'Default',
    },
    title: {
      title: 'Title',
    },
    code: {
      title: 'Country Code',
    },
    taxRate: {
      title: 'Tax Rate',
    },
    rates: {
      title: 'Shipping Rates',
    },
  },
  shippingRate: {
    schemaTitle: 'Shipping Rate',
    title: {
      title: 'Title',
    },
    amount: {
      title: 'Amount',
    },
    trackingUrl: {
      title: 'Tracking URL',
      description: 'URL to tracking service.',
    },
  },
  seo: {
    schemaTitle: 'SEO',
    metaTitle: {
      title: 'Meta-Title',
      description: 'Title used for search engines and browsers',
      validation: 'Titles longer than 50 may be truncated by search engines',
    },
    metaDescription: {
      title: 'Meta-Description',
      description: 'Description for search engines',
      validation: 'Descriptions longer than 150 may be truncated by search engines',
    },
    shareTitle: {
      title: 'Share-Title',
      description: 'Title used for social sharing cards',
      validation: 'Titles longer than 50 may be truncated by social sites',
    },
    shareDescription: {
      title: 'Share-Description',
      description: 'Description for social sharing cards',
      validation: 'Descriptions longer than 150 may be truncated by social sites',
    },
    shareImage: {
      title: 'Share-Image',
      description: 'Recommended size: 1200x630 (PNG or JPG)',
    },
    keywords: {
      title: 'Keywords',
    },
  },
  youtube: {
    schemaTitle: 'YouTube',
    url: {
      title: 'Url',
      description: 'YouTube Video URL or ID',
    },
    showControls: {
      title: 'Show Controls',
    },
    start: {
      title: 'Start at',
      description: 'Start Video at specific time (in seconds)',
    },
    autoload: {
      title: 'Autoload',
      description: 'Load video when scrolled into view',
    },
    autopause: {
      title: 'Autopause',
      description: 'Pauses video when user scrolls away',
    },
  },
  productSection: {
    schemaTitle: 'Products',
    preview: {
      products: 'Product(s)',
      categories: 'Category(ies)',
    },
    headline: {
      title: 'Headline',
    },
    categories: {
      title: 'Categories',
      validation: {
        atLeastOneCategoryRequired: 'At least one category is required'
      }
    },
    totalProducts: {
      title: 'Total Products',
      description: 'Number of products to show',
      validation: {
        numProducts: 'At least one and up to 50 products can be shown'
      }
    },
  },
  categorySection: {
    schemaTitle: 'Category List',
    preview: {
      allCategories: 'All Main Categories',
    },
    headline: {
      title: 'Headline',
    },
    category: {
      title: 'Category',
      description: 'If no category is selected, all main categories will be shown.',
    },
  },
  carousel: {
    schemaTitle: 'Carousel',
    preview: {
      slides: 'Slide(s)',
    },
    slides: {
      title: 'Slides',
    },
    autoplay: {
      title: 'Autoplay',
    },
    autoplayDelay: {
      title: 'Autoplay-Delay',
      description: 'Next slide will be shown after the given seconds.',
    },
    loop: {
      title: 'Loop',
    },
    slideSize: {
      title: 'Slide-Größe',
    },
    fade: {
      title: 'Fade',
      description: 'Fade-Animations while switching slides.',
    },
  },

  orderings: {
    asc: "Ascending",
    desc: "Descending",
  },


  localeBlock: {
    schemaTitle: 'Localized Block',
    translations: {
      title: 'Translations',
    },
  },
  localeImage: {
    schemaTitle: 'Localized Image',
    title: {
      title: 'Title',
    },
    altText: {
      title: 'Alternative Text',
    },
    validation: {
      assetRequired: 'Asset is required',
    },
  },
  localeString: {
    schemaTitle: 'Localized String',
    translations: {
      title: 'Translations',
    },
    validations: {
      allExist: 'All localizations must exist.',
    },
  },
  localeSlug: {
    schemaTitle: 'Localized URL Slug',
    translations: {
      title: 'Translations',
    },
  },
}