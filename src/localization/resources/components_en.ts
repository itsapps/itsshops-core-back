/* eslint-disable @typescript-eslint/naming-convention, camelcase */
export default {
  productCreatorTool: {
    name: 'product-manager',
    title: 'Product Manager',
    subtitle: 'Create products and variants in one step',
    sections: {
      variants: {
        title: 'Variants',
        count_one: '{{count}} variant',
        count_other: '{{count}} variants',
      },
    },
    placeholders: {
      productTitle: {
        wine: 'e.g. Grüner Veltliner',
        physicalDigital: 'e.g. T-Shirt',
        bundle: 'e.g. Birthday Bundle',
      },
      productPrice: 'e.g. 12.90',
    },
    messages: {
      productCreated: {
        title: 'Product created',
        description_one: '{{title}} with one variant.',
        description_other: '{{title}} with {{count}} variants.',
      },
      productCreatedFail: {
        title: 'Failed to create product',
      },
      variantExists: 'This variant already exists.',
      combinations: {
        warning: '⚠️ {{count}} variants — are you sure?',
      },
    },
    submit_zero: 'Create product',
    submit_one: 'Create product',
    submit_other: 'Create product with {{count}} variants',
    submitting: 'Creating product...',
    addVariantButton: {
      add: 'Add variant',
      addAnother: 'Add another {{title}}',
    },
    combinations: {
      options: 'Properties',
      loadingOptions: 'Loading options...',
      preview: 'Variant preview — {{enabledCount}} of {{totalCount}}',
      noOptionGroups: 'No option groups found. Create some first in the option groups list.',
      noOptions: 'No options available in this group',
    },
  },
  vinofact: {
    notInitialized: {
      title: 'Vinofact client not initialized.',
      description: 'Check your shop configuration features.',
    },
    winesLoadedError: {
      title: 'Could not load Vinofact wines.',
    },
  },

  fields: {
    product: 'Product',
    productVariant: 'Product variant',
  },
  ui: {
    dialog: {
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    actions: {
      create: 'Create',
      update: 'Update',
      cancel: 'Cancel',
      delete: 'Delete',
      remove: 'Remove',
      save: 'Save',
      add: 'Add',
      edit: 'Edit',
      optionalNote: 'Optional note',
    },
    errors: {
      failedToLoad: 'Failed to load data: {{errorMessage}}',
    },
    defaults: {
      noTitle: 'Untitled',
    },
  },
  product: {
    deleteNotAllowedVariantsExist: 'Product cannot be deleted because it is linked to variants.',
  },
  productVariant: {
    publishNotAllowedButByGenerating: 'Product variants can only be generated in products.',
    setInactiveNotAllowedReferencesExist:
      'Product variant cannot be deactivated because it is referenced in other documents.',
  },
  variants: {
    generate: 'Generate variants',
    coverImage: {
      select: 'Select cover image',
      remove: 'Remove selection',
    },
    deleteSingle: {
      title: 'Remove variant',
      confirm: 'Really delete the variant?',
    },
    deleteAll: {
      title: 'Remove all variants',
      confirm: 'Really delete the variants?',
    },
    selectProductNumber: 'Please assign a product number to generate variants for it.',
    couldNotDeleteAll: 'One or more variants could not be deleted because they are in use.',
  },
  optionsGroups: {
    addOption: 'Add option',
    confirmDelete: 'Really delete the option?',
    deleteErrorMessage:
      'Option cannot be deleted because it is used in one or more product variants.',
    groupDeleteNotAllowedOptionsExist:
      'Option group cannot be deleted because it contains options.',
    couldNotDeleteOption:
      'Option could not be deleted because it is used in one or more product variants.',
    defaults: {
      title: 'New option',
    },
  },
  categories: {
    deleteNotAllowedSubcategoriesExist:
      'Category cannot be deleted because it contains subcategories.',
  },
  order: {
    shipping: 'Shipping',
    billingAddress: 'Billing address',
    items: 'Items',
    freeProducts: 'Free products',
    vouchers: 'Vouchers',
    voucher: {
      notFound: 'Voucher no longer exists',
    },
    coupons: 'Coupons',
    coupon: {
      freeShipping: 'Free shipping',
    },
    discount: 'Discount',
    contactEmail: 'Contact email',
    total: 'Total',
    subtotal: 'Subtotal',
    trackingNumber: 'Tracking number',
    packaging: 'Packaging',
    pack: '{{packSize}}-pack',
    loading: 'Loading order...',
    orderNumber: 'Order number',
    invoiceNumber: 'Invoice number',
    vatRate: '{{vatRate}}% VAT',
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
      name: 'Status history',
      type: {
        title: 'Type',
        options: {
          payment: 'Payment',
          fulfillment: 'Shipping',
        },
      },
    },
    withdrawals: {
      title: 'Withdrawals',
      status: {
        received: 'Received',
        processing: 'Processing',
        refunded: 'Refunded',
        rejected: 'Rejected',
      },
    },
  },
  actions: {
    order: {
      sendMail: 'Send customer email',
      sending: 'Sending email...',
      error: 'Error sending customer email: {{message}}',
      sendMailSuccess: 'Email successfully sent',
      mailTypes: {
        orderConfirmation: 'Order confirmation',
        orderProcessing: 'Processing',
        orderInvoice: 'Invoice',
        orderShipping: 'Shipped',
        orderDelivered: 'Delivered',
        orderReturned: 'Returned',
        orderCanceled: 'Canceled',
        orderRefunded: 'Refunded',
        orderRefundedPartially: 'Partially refunded',
      },
      updateStatus: {
        title: 'Update status',
        refundAmount: 'Enter refund amount',
        enterValidAmount: 'Please enter a valid amount',
        notifyCustomer: 'Notify customer',
      },
      sendMailDialog: {
        title: 'Send email',
        selectMailType: 'Select email type',
        attachInvoice: 'Attach invoice PDF',
        send: 'Send',
      },
    },
    orderWithdrawal: {
      create: {
        title: 'Declare withdrawal',
        declaredAt: 'Declared on',
        reason: 'Reason / affected items (optional)',
        notify: 'Send confirmation email to customer',
        error: 'Could not create the withdrawal',
        alreadyOpen: 'An open withdrawal already exists for this order',
      },
      notifyError: 'Saved, but the email could not be sent',
      resend: {
        title: 'Resend confirmation',
        success: 'Confirmation email sent',
        error: 'Email could not be sent',
      },
    },
    refund: {
      title: 'Refund',
      refund: 'Refund',
      refunding: 'Refunding...',
      alreadyRefunded: 'This order has already been refunded',
      error: 'Error during refund: {{message}}',
      sendRefundSuccess: 'Refund successful',
    },
  },
  deployments: {
    title: 'Deployments',
    dialog: {
      header: 'Site deployments',
      actions: {
        cancel: 'Cancel',
        deploy: 'Deploy',
        close: 'Close',
        goToNetlify: 'Netlify',
      },
      noInfos: 'No information available',
      defaultDeploymentTitle: 'Triggered from Sanity',
    },
    status: {
      title: 'Status',
      options: {
        building: 'Deploying',
        ready: 'Ready',
        error: 'Error',
        none: 'No status',
      },
    },
    startedOn: 'Started on',
  },
  stock: {
    name: 'Stock',
    header: 'Low stock',
    loading: 'Loading products...',
    globalStockThreshold: 'Global lower limit',
    noThreshold: 'None',
    nothing: 'All products are in stock',
    summary: 'Summary',
    product: 'Product',
    variant: 'Product variant',
    products: 'Products',
    variants: 'Product variants',
  },
  exporters: {
    xlsx: {
      inventory: {
        title: 'Inventory (XLSX)',
      },
    },
  },
}
