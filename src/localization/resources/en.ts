export default {
  fields: {
    product: 'Product',
    productVariant: 'Product Variant',
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
      failedToLoad: "Failed to load data: {{errorMessage}}",
    }
  },
  product: {
    deleteNotAllowedVariantsExist: "Product cannot be deleted because it contains variants.",
  },
  productVariant: {
    publishNotAllowedButByGenerating: "Product variants can only be generated in products.",
    setInactiveNotAllowedReferencesExist: "Product variant cannot be deactivated because it is referenced in other documents.",
  },
  variants: {
    generate: 'Generate Variants',
    coverImage: {
      select: 'Select Cover Image',
      remove: 'Remove Selection',
    },
    deleteSingle: {
      title: 'Remove Variant',
      confirm: 'Delete Variant?',
    },
    deleteAll: {
      title: 'Delete all Variants',
      confirm: 'Delete Variants?',
    },
    selectProductNumber: 'Please set a product number on the product to generate variants.',
    couldNotDeleteAll: 'One or more variants could not be deleted because they are in use.',
  },
  optionsGroups: {
    addOption: "Add Option",
    confirmDelete: "Are you sure you want to delete this option?",
    deleteErrorMessage: "Cannot remove this option because it's used in one or more product variants.",
    groupDeleteNotAllowedOptionsExist: "Option group cannot be deleted because it contains options.",
    couldNotDeleteOption: "Cannot remove this option because it's used in one or more product variants.",
  },
  categories: {
    deleteNotAllowedSubcategoriesExist: "Category cannot be deleted because it contains subcategories.",
  },
  order: {
    shipping: "Shipping",
    billingAddress: "Billing Address",
    items: "Products",
    freeProducts: "Free Products",
    vouchers: "Vouchers",
    voucher: {
      notFound: 'Voucher does not exist anymore',
    },
    discount: "Discount",
    contactEmail: "Contact Email",
    total: "Total",
    subtotal: "Subtotal",
    trackingNumber: "Tracking Number",
    loading: "Loading Order...",
    orderNumber: "Order Number",
    invoiceNumber: "Invoice Number",
    totalWithVat: "Total (Incl. {{vatRate}}% Vat = {{total}})",
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
          fulfillment: 'Shipping',
        }
      },
    }
  },
  actions: {
    order: {
      sendMail: 'Send Customer email',
      sending: 'Sending mail ...',
      error: 'Error sending customer email: {{errorMessage}}',
      sendMailSuccess: 'Email successfully sent',
      mailTypes: {
        'order-confirmation': 'Order confirmation',
        'order-processing': 'Processing',
        'order-invoice': 'Invoice',
        'order-shipping': 'Shipping',
        'order-delivered': 'Delivered',
        'order-returned': 'Returned',
        'order-canceled': 'Canceled',
        'order-refunded': 'Refunded',
        'order-refunded-partially': 'Partially refunded',
      },
      updateStatus: {
        title: 'Update Status',
        refundAmount: 'Enter refund amount',
        enterValidAmount: 'Please enter a valid amount',
        notifyCustomer: 'Notify customer',
      },
    },
    refund: {
      title: 'Refund',
      refund: 'Refund',
      refunding: 'Refunding...',
      alreadyRefunded: 'This order is already refunded',
      error: 'Error refunding: {{errorMessage}}',
      sendRefundSuccess: 'Successfully refunded',
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
        goToNetlify: 'Go to Netlify',
      },
      noInfos: 'No information available',
      defaultDeploymentTitle: 'Triggered from Sanity',
    },
    status: {
      title: 'Status',
      options: {
        building: "Deploying",
        ready: "Ready",
        error: "Error",
        none: "No Status"
      }
    },
    startedOn: 'Started on',
  },
  stock: {
    name: 'Stock',
    header: 'Low Stock Items',
    loading: 'Loading Products...',
    globalStockThreshold: 'Global lower limit',
    noThreshold: 'None',
    nothing: 'All products are in stock',
    summary: 'Summary',
    product: 'Product',
    variant: 'Product Variant',
    products: 'Products',
    variants: 'Product Variants',
  },
  exporters: {
    xlsx: {
      inventory: {
        title: 'Inventory (XLSX)',
      }
    }
  },
}