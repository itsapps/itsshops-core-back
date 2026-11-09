/* eslint-disable @typescript-eslint/naming-convention, camelcase */
export default {
  productCreatorTool: {
    bundle: {
      vatFromItems: 'VAT is taken from the items (the price is split by their single prices).',
    },
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
    payment: {
      title: 'Payment method',
      types: {
        card: 'Card',
        eps: 'EPS',
        klarna: 'Klarna',
        paypal: 'PayPal',
        sepa_debit: 'SEPA Direct Debit',
        sofort: 'Sofort',
        giropay: 'Giropay',
        bancontact: 'Bancontact',
        ideal: 'iDEAL',
        twint: 'TWINT',
        link: 'Link',
      },
      wallets: {
        apple_pay: 'Apple Pay',
        google_pay: 'Google Pay',
        link: 'Link',
        samsung_pay: 'Samsung Pay',
      },
    },
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
    shippingVat: 'incl. {{vatRate}}% VAT',
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
          mail: 'Email',
        },
      },
      source: {
        admin: 'Studio',
        stripe: 'Stripe',
        'wc-api': 'ERP',
        system: 'Automatic',
      },
      note: 'Internal note',
      customerMessage: 'Message to customer',
    },
    withdrawals: {
      title: 'Withdrawals',
      status: {
        unmatched: 'Unmatched',
        received: 'Received',
        processing: 'Processing',
        refunded: 'Refunded',
        rejected: 'Rejected',
      },
      refundBy: 'Refund by {{date}}',
      overdueSince: 'Overdue since {{date}}',
    },
    refunds: {
      title: 'Refunds',
      refunded: 'Refunded',
      remaining: 'Remaining',
      source: {
        studio: 'Studio',
        stripe: 'Stripe dashboard',
      },
      status: {
        pending: 'Pending',
        failed: 'Failed',
        canceled: 'Canceled',
        requires_action: 'Action required',
      },
    },
  },
  actions: {
    order: {
      sendMail: 'Send customer email',
      sending: 'Sending email...',
      error: 'Error sending customer email: {{message}}',
      sendMailSuccess: 'Email successfully sent',
      internalNote: 'Internal note',
      internalNoteHint: 'Optional – saved in the status history only, never sent to the customer',
      customerMessage: 'Message to customer',
      customerMessageHint:
        'Optional – shown in the email below the standard text (max. {{max}} characters)',
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
        // history only (withdrawal receipt, core-front) — not offered in "Send mail"
        withdrawalReceipt: 'Withdrawal received',
      },
      updateStatus: {
        title: 'Update status',
        refundAmount: 'Enter refund amount',
        refundAmountLabel: 'Refund amount (€)',
        enterAmountBelowRemaining:
          'Enter an amount below the remaining {{remaining}} — choose “Refunded” for the whole rest',
        notifyCustomer: 'Notify customer',
        trackingCodeHint: 'Optional – shown in the shipping confirmation',
        openWithdrawal:
          'This order has an open withdrawal — handle the refund there (“Refund & close” also closes the withdrawal).',
        openWithdrawalLink: 'Open the withdrawal',
      },
      sendMailDialog: {
        title: 'Send email',
        selectMailType: 'Select email type',
        attachInvoice: 'Attach invoice PDF',
        send: 'Send',
        noStoredRefund: 'No refund is stored for this order — the mail cannot state an amount.',
        notFullyRefunded:
          'The order is not fully refunded ({{refunded}} of {{total}}) — send the partial-refund mail.',
      },
    },
    orderWithdrawal: {
      create: {
        title: 'Declare withdrawal',
        declaredAt: 'Declared on',
        declaredAtHint: 'Date the withdrawal was received',
        declaredAtInvalid: 'Enter the date the withdrawal was received — not in the future',
        reason: 'Reason / affected items (optional)',
        notify: 'Send confirmation email to customer',
        error: 'Could not create the withdrawal',
        alreadyOpen: 'An open withdrawal already exists for this order',
      },
      assign: {
        title: 'Assign order',
        suggestions: 'Possible orders',
        noSuggestions: 'No order matches the submitted details — search below.',
        select: 'Select',
        searchLabel: 'Order number or email',
        search: 'Search',
        results: '{{count}} order(s) found',
        noResults: 'No order found',
        picked: 'Assign to order #{{orderNumber}}',
        notify: 'Send the confirmation to the order’s email ({{email}})',
      },
      unassign: {
        title: 'Unassign order',
        confirm:
          'Unlink this withdrawal from order #{{orderNumber}}? It becomes “Unmatched” again and can be assigned to the right order.',
        noteLine: 'Unassigned from order #{{orderNumber}}, {{date}}',
      },
      changedMeanwhile:
        'The withdrawal was changed meanwhile — close this dialog and open it again',
      deleteOnlyUnmatched: 'Only unmatched withdrawals can be deleted.',
      notifyError: 'Saved, but the email could not be sent',
      resend: {
        title: 'Resend confirmation',
        success: 'Confirmation email sent',
        error: 'Email could not be sent',
      },
      resolve: {
        title: 'Refund & close',
        alreadyRefunded: 'The order is already refunded. This will close the withdrawal.',
        choiceLegend: 'Refund',
        full: 'Full (rest {{amount}})',
        partial: 'Partial',
        partialHint: 'The withdrawal is closed; the rest is not refunded.',
        closeOnly: 'Close only ({{amount}} already refunded, no further refund)',
        markReturned: 'Goods are back (order → “Returned”)',
        notify: 'Send refund confirmation email',
        closeFailed:
          'The order is updated, but the withdrawal could not be closed ({{message}}) — press “Refund & close” again; it then only closes.',
      },
      status: {
        rejectReason: 'Reason (internal)',
        rejectHint: 'Saved in the internal note. Telling the customer is up to you.',
        reject: 'Reject',
        rejectedNote: 'Rejected on {{date}}: {{reason}}',
      },
      guide: {
        title: 'Next step',
        step: {
          assign:
            'Assign the order (“Assign order”) or delete the withdrawal after checking — by {{date}} at the latest.',
          close: 'The order is already refunded → “Refund & close” closes the withdrawal.',
          refundNotShipped: 'Not shipped yet → “Refund & close” (also cancels the order).',
          refundNothingToWait: 'Nothing more to wait for → “Refund & close”.',
          partial:
            '{{amount}} already refunded (e.g. via the order’s “Update status” or the Stripe dashboard) → “Refund & close”: refund the rest or close only.',
          wait: 'Wait for the goods (set “Processing”). Once they are back or the customer proves dispatch → “Refund & close” (full or partial).',
          done: 'Refunded {{amount}}, last on {{date}}.',
          doneNoAmount: 'Refunded.',
          rejected: 'Closed as rejected (see the internal note).',
          noOrder: 'The linked order was not found.',
        },
        deadline:
          'Refund by {{date}} (14 days from receiving the withdrawal). Holding it back is allowed until the goods are back or the customer proves dispatch.',
        overdue: 'Overdue since {{date}}',
        howTo: {
          summary: 'How it works',
          assign:
            'Unmatched: “Assign order” links the right order (confirmation to the order’s email) — or delete it after checking, within 30 days at the latest. Wrong pick: “Unassign order”.',
          notShipped:
            'Not shipped yet: “Refund & close” — refunds everything and cancels the order.',
          shipped:
            'Shipped or delivered: set “Processing” and wait for the goods. Once back (or dispatch proven): “Refund & close”, full or partial (e.g. a deduction for an opened bottle), and tick “Goods are back”.',
          partial:
            'A partial refund closes the withdrawal — the rest is not refunded. If something was refunded already, choose “Close only” or refund the rest.',
          reject:
            'No right of withdrawal: status “Rejected” with a reason (internal). Telling the customer is up to you.',
          deadline:
            'Deadline: refund within 14 days of receiving the withdrawal. Holding it back is allowed until the goods are back or the customer proves dispatch.',
        },
      },
    },
    refund: {
      title: 'Refund',
      refund: 'Refund',
      refunding: 'Refunding...',
      alreadyRefunded: 'This order has already been refunded',
      error: 'Error during refund: {{message}}',
      sendRefundSuccess: 'Refund successful',
      changedMeanwhile: 'The order was changed meanwhile — close this dialog and open it again',
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
