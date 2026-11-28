/* eslint-disable @typescript-eslint/naming-convention, camelcase */
export default {
  productCreatorTool: {
    advanced: 'Advanced',
    tax: {
      shopDefault: 'Empty = shop default: {{title}}',
      noShopDefault: 'Empty = shop default (none is set in the shop settings)',
    },
    reasons: {
      label: 'Not possible yet, because:',
      title: 'Product name is missing',
      noVariant: 'No variant selected',
      priceMissing: 'Price missing for {{label}} (or set a product price)',
      priceMissingExisting: 'Price missing for {{label}} (the product has no price)',
      bundleNoItems: '{{label}} contains no products',
      noWineCell: 'No bottle ticked in the table',
      stockInvalid: '{{label}}: stock must be empty or a whole number from 0',
      bundleQuantity: '{{label}}: quantity must be a whole number from 1',
    },
    extras: {
      stockHint: 'Empty = unlimited (not 0).',
      stockInvalid: 'A whole number from 0, or empty for unlimited.',
    },
    summary: {
      label: 'These variants will be created',
      create_one: 'To create: 1 product, 1 variant',
      create_other: 'To create: 1 product, {{count}} variants',
      createWine_one: 'To create: 1 wine, 1 bottle',
      createWine_other: 'To create: 1 wine, {{count}} vintages & bottles',
      add_one: 'To add: 1 variant to {{title}}',
      add_other: 'To add: {{count}} variants to {{title}}',
      noPrice: 'no price',
      comingSoon: 'coming soon',
    },
    inherited: {
      price: '{{price}} from the product',
      taxProduct: 'Empty = from the product: {{title}}',
      taxShopDefault: 'Empty = shop default: {{title}}',
      taxNone: 'Empty = shop default (none set)',
    },
    duplicates: {
      title: 'Does this exist already?',
      announce: 'Note: a similar product exists already.',
      createAnyway: 'You can still create it.',
      sameName: 'A product with this name exists:',
      wineExact: '{{wine}} ({{volumes}}) is already in',
      wineLike: 'Exists already:',
      addVintagesThere: '— add the vintages there?',
    },
    productSection: {
      title: 'Product',
      titleWine: 'Wine',
      description: 'Name and defaults for every variant of this product.',
      descriptionWine: 'Name and defaults for every vintage & bottle of this wine.',
    },
    wine: {
      sectionTitle: 'Vintages & bottles',
      sectionDescription:
        'Pick a wine from VinoFact, then tick the bottles to create in the table.',
      detailsTitle: 'Prices & details of the ticked bottles',
      detailsDescription: 'Empty = value from the product.',
      noCellYet: 'No bottle ticked yet — tick what to create in the table above.',
      loadingWines: 'Loading wines from VinoFact…',
      pickFirst: 'Wine from VinoFact',
      pickFirstHint:
        'The table then shows every vintage with this name; you can add other wines too.',
      titleFromVinofact: 'Taken from VinoFact',
      titleFromWineLater: 'Leave empty: taken from the wine below. Or type your own.',
      pickFirstHintTitle:
        'The wine name becomes the product title (you can change it). The table then shows every vintage with this name; you can add other wines too.',
      titleSuggestion: 'Suggestion from VinoFact: {{title}}',
      restoreSuggestion: 'Use suggestion',
      gridCaption: 'Vintages and bottle sizes',
      wineColumn: 'Vintage',
      removeColumn: 'Remove',
      cellLabel: '{{wine}}, {{volume}}',
      cellLabelExisting: '{{wine}}, {{volume}} (exists already)',
      gridEmpty: 'No wines in the table — add one below.',
      gridLegend: 'Greyed-out tick = exists already.',
      showOlder: 'Show older vintages ({{count}})',
      hideOlder: 'Hide older vintages',
      addWine: 'Add another wine',
      addVolume: 'Add bottle size',
    },
    addVariants: {
      productPrice: 'Product price: {{price}}',
      noProductPrice: 'No product price — every variant needs its own price',
      productTax: 'Tax category: {{title}}',
      shopDefaultTax: 'Tax category: shop default ({{title}})',
      noTax: 'Tax category: shop default (none set)',
      added_one: 'One variant added.',
      added_other: '{{count}} variants added.',
      publishFirst: 'Publish the product first',
    },
    a11y: {
      removeRow: 'Remove {{label}}',
      clearWine: 'Deselect wine {{title}}',
      removeItem: 'Remove {{label}}',
      removeWine: 'Remove {{title}} from the table',
    },
    errors: {
      loadData: 'Failed to load data',
      loadOptionGroups: 'Failed to load option groups',
      loadVariants: 'Failed to load variants',
      loadProduct: 'Failed to load product',
      productNotFound: 'Product not found.',
      unknownKind: 'Unknown product kind.',
      missingProductId: 'Missing product id.',
      loadExisting: 'Could not check existing products',
    },
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
        open: 'Open product',
        description_one: '{{title}} with one variant.',
        description_other: '{{title}} with {{count}} variants.',
      },
      variantsAdded: {
        title: 'Variants added',
        description_one: 'One variant added to {{title}}.',
        description_other: '{{count}} variants added to {{title}}.',
      },
      productCreatedFail: {
        title: 'Failed to create product',
      },
      variantExists: 'This variant already exists.',
      combinations: {
        warning: '⚠️ {{count}} variants — are you sure?',
      },
    },
    lastCreated: 'Last created: {{title}}',
    submit_zero: 'Create product',
    submit_one: 'Create product',
    submit_other: 'Create product with {{count}} variants',
    submitWine_zero: 'Create wine',
    submitWine_one: 'Create wine with one bottle',
    submitWine_other: 'Create wine with {{count}} vintages & bottles',
    submitAdd_zero: 'Add variants',
    submitAdd_one: 'Add one variant',
    submitAdd_other: 'Add {{count}} variants',
    submitAddWine_zero: 'Add vintages & bottles',
    submitAddWine_one: 'Add one bottle',
    submitAddWine_other: 'Add {{count}} vintages & bottles',
    submitting: 'Creating product...',
    submittingAdd: 'Adding variants...',
    addVariantButton: {
      add: 'Add variant',
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
      description:
        'Check your shop configuration features, or ask an administrator to enter the integration settings.',
    },
    winesLoadedError: {
      title: 'Could not load Vinofact wines.',
    },
    importFailed: {
      title: 'Could not import the bottle images',
    },
    bottleImage: {
      import: 'Import bottle image from VinoFact',
      reimport: 'Import bottle image from VinoFact again',
      confirm: {
        title: 'Import the bottle image again?',
        text: "VinoFact's bottle image replaces the current image; crop and hotspot are reset. Existing alt texts are kept — to take VinoFact's alt text, clear the alt text field first.",
        confirm: 'Replace',
        cancel: 'Cancel',
      },
      imported: 'Bottle image imported from VinoFact',
      noImage: 'No bottle image in VinoFact',
      noImageDescription: 'VinoFact has no bottle image for this wine.',
      failed: 'Could not import the bottle image',
    },
    bottleImages: {
      action: 'Import bottle images from VinoFact',
      running: 'Importing bottle images…',
      notPublished: 'Available once the product is published.',
      allHaveImage: 'All variants already have an image',
      summaryTitle: 'Bottle images from VinoFact',
      summary: '{{imported}} imported, {{noImage}} without image in VinoFact, {{failed}} failed',
      checkbox: 'Import bottle images from VinoFact',
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
    pickup: 'Pickup',
    pickupDeadline: 'Collect by {{date}}',
    pickupOverdue: 'Pickup period expired on {{date}}',
    billingAddress: 'Billing address',
    items: 'Items',
    freeProducts: 'Free products',
    vouchers: 'Vouchers',
    voucher: {
      notFound: 'Voucher no longer exists',
    },
    discounts: {
      title: 'Discounts',
      code: 'Code',
      automatic: 'Automatic',
      freeShipping: 'Free shipping',
      alreadyFree: 'Shipping was already free',
      afterDiscount: 'after discount {{amount}}',
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
    freeShippingReason: {
      threshold: 'Free shipping (order value)',
      discount: 'Free shipping (discount)',
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
      // Pickup orders: `shipped` = ready for pickup, `delivered` = collected.
      pickupOptions: {
        shipped: 'Ready for pickup',
        delivered: 'Collected',
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
    erpAccepted: 'Accepted by the ERP on {{date}}',
    statusHistory: {
      name: 'Status history',
      type: {
        title: 'Type',
        options: {
          payment: 'Payment',
          fulfillment: 'Shipping',
          mail: 'Email',
          erp: 'ERP',
          system: 'System',
        },
      },
      erpStatus: {
        accepted: 'Accepted',
      },
      systemStatus: {
        discountsMigrated: 'Format migrated',
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
      pickupMailTypes: {
        orderShipping: 'Ready for pickup',
        orderDelivered: 'Collected',
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
        success: 'Status “{{status}}” set',
        successMailed: 'Status “{{status}}” set — customer notified',
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
        success: 'Withdrawal declared',
        successMailed: 'Withdrawal declared — confirmation sent to {{email}}',
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
        notifyBoth:
          'Send the confirmation to the order’s email ({{email}}) and to the address the withdrawal was submitted with ({{submitted}})',
        matches: 'Matches: {{fields}}',
        match: { orderNumber: 'order number', email: 'email', name: 'name' },
        success: 'Assigned to order #{{orderNumber}}',
        successMailed: 'Assigned to order #{{orderNumber}} — confirmation sent to {{email}}',
      },
      unassign: {
        title: 'Unassign order',
        confirm:
          'Unlink this withdrawal from order #{{orderNumber}}? It becomes “Unmatched” again and can be assigned to the right order.',
        noteLine: 'Unassigned from order #{{orderNumber}}, {{date}}',
        success: 'Unassigned from order #{{orderNumber}}',
      },
      changedMeanwhile:
        'The withdrawal was changed meanwhile — close this dialog and open it again',
      deleteOnlyUnmatched: 'Only unmatched withdrawals can be deleted.',
      notifyError: 'Saved, but the email could not be sent',
      recipientsBoth: '{{first}} and {{second}}',
      resend: {
        title: 'Resend confirmation',
        confirm: 'Send the withdrawal confirmation to {{email}} again?',
        confirmBoth:
          'Send the withdrawal confirmation again to the order’s address ({{email}}) and to the address it was submitted with ({{submitted}})?',
        send: 'Send',
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
        successRefund: '{{amount}} refunded, withdrawal closed',
        successClosed: 'Withdrawal closed',
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
          assignIntro: 'Unmatched — the details match no order:',
          assignOrderLead: 'Belongs to an order',
          assignOrder:
            '(e.g. a typo): “Assign order”. The refund period is already running (see below).',
          assignDeleteLead: 'Belongs to no order',
          assignDelete:
            '(e.g. spam): delete it — by {{date}} at the latest, because a stranger’s data may be kept for 30 days at most.',
          close: 'The order is already refunded → “Refund & close” closes the withdrawal.',
          refundNotShipped: 'Not shipped yet → “Refund & close” (also cancels the order).',
          refundNotCollected: 'Not collected yet → “Refund & close” (also cancels the order).',
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
            'Unmatched: “Assign order” links the right order (confirmation to the order’s email) — or, if it belongs to no order, delete it (data protection: keep it 30 days at most). Wrong pick: “Unassign order”.',
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
  integrations: {
    title: 'Integrations',
    dialogTitle: 'Integration settings',
    keys: {
      functionsSecret: {
        title: 'Server functions secret',
        description:
          "Must match SERVER_FUNCTIONS_SECRET of this environment's frontend (Netlify env). Used for refunds and customer mails.",
      },
      netlifyBuildHook: {
        title: 'Netlify build hook',
        description:
          "Build hook URL of this environment's frontend (Netlify → Project configuration → Build hooks). Used by the Deploy button.",
      },
      vinofactToken: {
        title: 'Vinofact API token',
        description: 'Token for the Vinofact wine import.',
      },
    },
    show: 'Show value',
    hide: 'Hide value',
    save: 'Save',
    cancel: 'Cancel',
    saved: 'Integration settings saved',
    saveFailed: 'Integration settings could not be saved',
    missingSecrets:
      'Integration settings are missing. Ask an administrator to enter them (toolbar → Integrations).',
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
      titleLabel: 'Deploy note (optional)',
      statusAlt: 'Netlify deploy status',
      statusHint: 'The status refreshes every 10 seconds. Details: "Netlify".',
      requested: 'Build requested',
      requestFailed: 'Build could not be requested',
      noHook: 'No build hook set. An administrator can enter it under toolbar → Integrations.',
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
  inheritance: {
    productImage: 'Product image',
    noValue: 'no value',
    unnamedVariant: 'Variant {{n}}',
    draftSuffix: ' (draft)',
    variant: {
      fromProduct: 'From the product: {{value}}',
      fromShopDefault: 'From the shop default: {{value}}',
      productEmpty: 'The product has no value.',
      noCompareAt: 'No compare-at price (own price set).',
      own: 'Own value — product: {{value}}. Clear the field to use the product value.',
      ownProductEmpty: 'Own value — the product has none.',
      draftDiffers: '(Product draft: {{value}})',
    },
    product: {
      overridden_one: 'Own value in {{n}} of {{count}} variant.',
      overridden_other: 'Own value in {{n}} of {{count}} variants.',
      listLabel: 'Variants with an own value',
    },
  },
  exporters: {
    xlsx: {
      inventory: {
        title: 'Inventory (XLSX)',
      },
    },
  },
}
