/* eslint-disable @typescript-eslint/naming-convention, camelcase */
export default {
  productCreatorTool: {
    name: 'produkt-manager',
    title: 'Produktmanager',
    subtitle: 'Produkte und Varianten erstellen in einem Schritt',
    sections: {
      variants: {
        title: 'Varianten',
        count_one: '{{count}} Variante',
        count_other: '{{count}} Varianten',
      },
    },
    placeholders: {
      productTitle: {
        wine: 'z.B. Grüner Veltliner',
        physicalDigital: 'z.B. T-Shirt',
        bundle: 'z.B. Geburtstagspacket',
      },
      productPrice: 'z.B. 12,90',
    },
    messages: {
      productCreated: {
        title: 'Produkt erstellt',
        description_one: '{{title}} mit {{count}} Variante.',
        description_other: '{{title}} mit {{count}} Varianten.',
      },
      productCreatedFail: {
        title: 'Fehler beim Erstellen des Produkts',
      },
      variantExists: 'Diese Variante existieren bereits.',
      combinations: {
        warning: '⚠️ {{count}} Variants — bist Du sicher?',
      },
    },
    submit_zero: 'Produkt erstellen',
    submit_one: 'Produkt erstellen',
    submit_other: 'Produkt mit {{count}} Varianten erstellen',
    submitting: 'Produkt wird erstellt...',
    addVariantButton: {
      add: 'Variante hinzufügen',
      addAnother: 'Noch einen {{title}} hinzufügen',
    },
    combinations: {
      options: 'Eigenschaften',
      loadingOptions: 'Optionen werden geladen...',
      preview: 'Varianten Vorschau — {{enabledCount}} von {{totalCount}}',
      noOptionGroups:
        'Keine Optionengruppen gefunden. Erstelle zuerst welche in der Optionengruppen-Liste.',
      noOptions: 'Keine Optionen in dieser Gruppe vorhanden',
    },
  },
  vinofact: {
    notInitialized: {
      title: 'Vinofact client not initialized.',
      description: 'Check your shop configuration features.',
    },
    winesLoadedError: {
      title: 'Vinofact Weine konnten nicht geladen werden.',
    },
  },

  fields: {
    product: 'Produkt',
    productVariant: 'Produktvariante',
  },
  ui: {
    dialog: {
      confirm: 'Bestätigen',
      cancel: 'Abbrechen',
    },
    actions: {
      create: 'Erstellen',
      update: 'Aktualisieren',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      remove: 'Entfernen',
      save: 'Speichern',
      add: 'Hinzufügen',
      edit: 'Bearbeiten',
      optionalNote: 'Optionale Notiz',
    },
    errors: {
      failedToLoad: 'Fehler beim Laden der Daten: {{errorMessage}}',
    },
    defaults: {
      noTitle: 'Ohne Titel',
    },
  },
  product: {
    deleteNotAllowedVariantsExist:
      'Produkt kann nicht gelöscht werden, weil es mit Varianten verknüpft ist.',
  },
  productVariant: {
    publishNotAllowedButByGenerating: 'Produktvarianten können nur in Produkten generiert werden.',
    setInactiveNotAllowedReferencesExist:
      'Produktvariante kann nicht deaktiviert werden, weil sie in anderen Dokumenten referenziert ist.',
  },
  variants: {
    generate: 'Varianten generieren',
    coverImage: {
      select: 'Cover-Bild auswählen',
      remove: 'Auswahl entfernen',
    },
    deleteSingle: {
      title: 'Variante entfernen',
      confirm: 'Variante wirklich löschen?',
    },
    deleteAll: {
      title: 'Alle Varianten entfernen',
      confirm: 'Varianten wirklich löschen?',
    },
    selectProductNumber:
      'Bitte gib dem Produkt eine Produktnummer, um dafür Varianten zu generieren.',
    couldNotDeleteAll:
      'Eine oder mehrere Varianten konnten nicht gelöscht werden, weil sie in Verwendung sind.',
  },
  optionsGroups: {
    addOption: 'Option hinzufügen',
    confirmDelete: 'Option wirklich löschen?',
    deleteErrorMessage:
      'Option kann nicht gelöscht werden, weil sie in einer oder mehreren Produktvarianten verwendet wird.',
    groupDeleteNotAllowedOptionsExist:
      'Optionengruppe kann nicht gelöscht werden, weil sie Optionen enthält.',
    couldNotDeleteOption:
      'Option konnte nicht gelöscht werden, weil sie in einer oder mehreren Produktvarianten verwendet wird.',
    defaults: {
      title: 'Neue Option',
    },
  },
  categories: {
    deleteNotAllowedSubcategoriesExist:
      'Kategorie kann nicht gelöscht werden, weil sie Unterkategorien enthält.',
  },
  order: {
    shipping: 'Versand',
    billingAddress: 'Rechnungsadresse',
    items: 'Produkte',
    freeProducts: 'Gratis Produkte',
    vouchers: 'Gutscheine',
    voucher: {
      notFound: 'Gutschein existiert nicht mehr',
    },
    discount: 'Ermäßigung',
    contactEmail: 'Kontakt E-Mail',
    total: 'Gesamtsumme',
    subtotal: 'Zwischensumme',
    trackingNumber: 'Sendungsnummer',
    loading: 'Lade Bestellung...',
    orderNumber: 'Bestellnummer',
    invoiceNumber: 'Rechungsnummer',
    totalWithVat: 'Gesamt (Inkl. {{vatRate}}% MwSt = {{total}})',
    status: {
      title: 'Status',
      options: {
        created: 'Erstellt',
        processing: 'In Bearbeitung',
        shipped: 'Versendet',
        delivered: 'Angekommen',
        canceled: 'Storniert',
        returned: 'Zurückgeliefert',
      },
    },
    paymentStatus: {
      title: 'Zahlungsstatus',
      options: {
        succeeded: 'Bezahlt',
        refunded: 'Refundiert',
        partiallyRefunded: 'Teilweise refundiert',
      },
    },
    statusHistory: {
      name: 'Statusverlauf',
      type: {
        title: 'Typ',
        options: {
          payment: 'Zahlung',
          fulfillment: 'Versand',
        },
      },
    },
  },
  actions: {
    order: {
      sendMail: 'Kundenemail senden',
      sending: 'Email wird versendet ...',
      error: 'Fehler beim Versenden der Kundenmail: {{errorMessage}}',
      sendMailSuccess: 'Email erfolgreich versendet',
      mailTypes: {
        'order-confirmation': 'Bestellbestätigung',
        'order-processing': 'In Bearbeitung',
        'order-invoice': 'Rechnung',
        'order-shipping': 'Versendet',
        'order-delivered': 'Angekommen',
        'order-returned': 'Zurückgeliefert',
        'order-canceled': 'Storniert',
        'order-refunded': 'Refundiert',
        'order-refunded-partially': 'Teilweise refundiert',
      },
      updateStatus: {
        title: 'Status aktualisieren',
        refundAmount: 'Rückerstattungsbetrag eingeben',
        enterValidAmount: 'Bitte geben Sie einen gültigen Betrag ein',
        notifyCustomer: 'Kunde benachrichtigen',
      },
    },
    refund: {
      title: 'Rückerstattung',
      refund: 'Rückerstatten',
      refunding: 'Rückerstatten...',
      alreadyRefunded: 'Diese Bestellung wurde bereits rückerstattet',
      error: 'Fehler während der Rückerstattung: {{errorMessage}}',
      sendRefundSuccess: 'Rückerstattung erfolgreich',
    },
  },
  deployments: {
    title: 'Veröffentlichungen',
    dialog: {
      header: 'Webpage-Veröffentlichungen',
      actions: {
        cancel: 'Abbrechen',
        deploy: 'Veröffentlichen',
        close: 'Schließen',
        goToNetlify: 'Netlify',
      },
      noInfos: 'Keine Informationen verfügbar',
      defaultDeploymentTitle: 'Von Sanity initiiert',
    },
    status: {
      title: 'Status',
      options: {
        building: 'Wird gebaut',
        ready: 'Bereit',
        error: 'Fehler',
        none: 'Kein Status',
      },
    },
    startedOn: 'Gestarted am',
  },
  stock: {
    name: 'Lagerbestand',
    header: 'Niedere Lagerbestände',
    loading: 'Lade Produkte...',
    globalStockThreshold: 'Allgemeines unteres Limit',
    noThreshold: 'Keines',
    nothing: 'Alle Produkte sind auf Lager',
    summary: 'Zusammenfassung',
    product: 'Produkt',
    variant: 'Produktvariante',
    products: 'Produkte',
    variants: 'Produktvarianten',
  },
  exporters: {
    xlsx: {
      inventory: {
        title: 'Lagerbestand (XLSX)',
      },
    },
  },
}
