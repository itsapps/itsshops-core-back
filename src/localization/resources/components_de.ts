/* eslint-disable @typescript-eslint/naming-convention, camelcase */
export default {
  productCreatorTool: {
    bundle: {
      vatFromItems:
        'Die MwSt. wird aus den enthaltenen Produkten übernommen (Preis aufgeteilt nach ihren Einzelpreisen).',
    },
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
        description_one: '{{title}} mit einer Variante.',
        description_other: '{{title}} mit {{count}} Varianten.',
      },
      productCreatedFail: {
        title: 'Fehler beim Erstellen des Produkts',
      },
      variantExists: 'Diese Variante existiert bereits.',
      combinations: {
        warning: '⚠️ {{count}} Varianten — bist Du sicher?',
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
      preview: 'Varianten-Vorschau — {{enabledCount}} von {{totalCount}}',
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
    payment: {
      title: 'Zahlungsart',
      types: {
        card: 'Karte',
        eps: 'EPS',
        klarna: 'Klarna',
        paypal: 'PayPal',
        sepa_debit: 'SEPA-Lastschrift',
        sofort: 'Sofortüberweisung',
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
    shipping: 'Versand',
    billingAddress: 'Rechnungsadresse',
    items: 'Produkte',
    freeProducts: 'Gratis Produkte',
    vouchers: 'Gutscheine',
    voucher: {
      notFound: 'Gutschein existiert nicht mehr',
    },
    coupons: 'Rabattcodes',
    coupon: {
      freeShipping: 'Gratisversand',
    },
    discount: 'Ermäßigung',
    contactEmail: 'Kontakt E-Mail',
    total: 'Gesamtsumme',
    subtotal: 'Zwischensumme',
    trackingNumber: 'Sendungsnummer',
    packaging: 'Verpackung',
    pack: '{{packSize}}er',
    loading: 'Lade Bestellung...',
    orderNumber: 'Bestellnummer',
    invoiceNumber: 'Rechungsnummer',
    vatRate: '{{vatRate}}% MwSt',
    shippingVat: 'davon {{vatRate}}% MwSt',
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
          mail: 'E-Mail',
        },
      },
      source: {
        admin: 'Studio',
        stripe: 'Stripe',
        'wc-api': 'Warenwirtschaft',
        system: 'Automatisch',
      },
      note: 'Interne Notiz',
      customerMessage: 'Nachricht an den Kunden',
    },
    withdrawals: {
      title: 'Widerrufe',
      status: {
        unmatched: 'Nicht zugeordnet',
        received: 'Eingegangen',
        processing: 'In Bearbeitung',
        refunded: 'Erstattet',
        rejected: 'Abgelehnt',
      },
      refundBy: 'Erstattung bis {{date}}',
      overdueSince: 'Überfällig seit {{date}}',
    },
    refunds: {
      title: 'Rückerstattungen',
      refunded: 'Erstattet',
      remaining: 'Offen',
      source: {
        studio: 'Studio',
        stripe: 'Stripe-Dashboard',
      },
      status: {
        pending: 'Ausstehend',
        failed: 'Fehlgeschlagen',
        canceled: 'Abgebrochen',
        requires_action: 'Aktion erforderlich',
      },
    },
  },
  actions: {
    order: {
      sendMail: 'Kundenemail senden',
      sending: 'Email wird versendet ...',
      error: 'Fehler beim Versenden der Kundenmail: {{message}}',
      sendMailSuccess: 'Email erfolgreich versendet',
      internalNote: 'Interne Notiz',
      internalNoteHint:
        'Optional – wird nur im Statusverlauf gespeichert, nie an den Kunden gesendet',
      customerMessage: 'Nachricht an den Kunden',
      customerMessageHint:
        'Optional – erscheint in der Email unter dem Standardtext (max. {{max}} Zeichen)',
      mailTypes: {
        orderConfirmation: 'Bestellbestätigung',
        orderProcessing: 'In Bearbeitung',
        orderInvoice: 'Rechnung',
        orderShipping: 'Versendet',
        orderDelivered: 'Angekommen',
        orderReturned: 'Zurückgeliefert',
        orderCanceled: 'Storniert',
        orderRefunded: 'Refundiert',
        orderRefundedPartially: 'Teilweise refundiert',
        // history only (withdrawal receipt, core-front) — not offered in "Send mail"
        withdrawalReceipt: 'Widerruf erhalten',
      },
      updateStatus: {
        title: 'Status aktualisieren',
        refundAmount: 'Rückerstattungsbetrag eingeben',
        refundAmountLabel: 'Rückerstattungsbetrag (€)',
        enterAmountBelowRemaining:
          'Bitte geben Sie einen Betrag unter dem offenen Betrag von {{remaining}} ein — für den ganzen Rest „Refundiert“ wählen',
        notifyCustomer: 'Kunde benachrichtigen',
        trackingCodeHint: 'Optional – wird in der Versandbestätigung angezeigt',
        openWithdrawal:
          'Diese Bestellung hat einen offenen Widerruf – die Erstattung dort durchführen („Erstatten & abschließen“ schließt auch den Widerruf ab).',
        openWithdrawalLink: 'Zum Widerruf',
      },
      sendMailDialog: {
        title: 'Email senden',
        selectMailType: 'Email-Typ auswählen',
        attachInvoice: 'Rechnungs-PDF anhängen',
        send: 'Senden',
        noStoredRefund:
          'Für diese Bestellung ist keine Rückerstattung gespeichert — die Email kann keinen Betrag nennen.',
        notFullyRefunded:
          'Die Bestellung ist nicht vollständig erstattet ({{refunded}} von {{total}}) — bitte die Email zur Teilrückerstattung senden.',
      },
    },
    orderWithdrawal: {
      create: {
        title: 'Widerruf erfassen',
        declaredAt: 'Erklärt am',
        declaredAtHint: 'Datum, an dem der Widerruf eingegangen ist',
        declaredAtInvalid:
          'Datum eingeben, an dem der Widerruf eingegangen ist – nicht in der Zukunft',
        reason: 'Grund / betroffene Artikel (optional)',
        notify: 'Bestätigungs-E-Mail an Kunden senden',
        error: 'Widerruf konnte nicht erstellt werden',
        alreadyOpen: 'Für diese Bestellung existiert bereits ein offener Widerruf',
      },
      assign: {
        title: 'Bestellung zuordnen',
        suggestions: 'Mögliche Bestellungen',
        noSuggestions: 'Keine Bestellung passt zu den Angaben – unten suchen.',
        select: 'Auswählen',
        searchLabel: 'Bestellnummer oder E-Mail',
        search: 'Suchen',
        results: '{{count}} Bestellung(en) gefunden',
        noResults: 'Keine Bestellung gefunden',
        picked: 'Zuordnen zu Bestellung #{{orderNumber}}',
        notify: 'Bestätigung an die E-Mail der Bestellung senden ({{email}})',
      },
      unassign: {
        title: 'Zuordnung aufheben',
        confirm:
          'Den Widerruf von Bestellung #{{orderNumber}} lösen? Er ist dann wieder „Nicht zugeordnet“ und kann der richtigen Bestellung zugeordnet werden.',
        noteLine: 'Zuordnung zu #{{orderNumber}} aufgehoben, {{date}}',
      },
      changedMeanwhile: 'Der Widerruf wurde inzwischen geändert – Dialog schließen und neu öffnen',
      deleteOnlyUnmatched: 'Nur nicht zugeordnete Widerrufe können gelöscht werden.',
      notifyError: 'Gespeichert, aber die E-Mail konnte nicht gesendet werden',
      resend: {
        title: 'Bestätigung erneut senden',
        success: 'Bestätigungs-E-Mail gesendet',
        error: 'E-Mail konnte nicht gesendet werden',
      },
      resolve: {
        title: 'Erstatten & abschließen',
        alreadyRefunded:
          'Die Bestellung ist bereits erstattet. Damit wird der Widerruf abgeschlossen.',
        choiceLegend: 'Erstattung',
        full: 'Vollständig (Rest {{amount}})',
        partial: 'Teilweise',
        partialHint: 'Der Widerruf wird abgeschlossen; der Rest wird nicht erstattet.',
        closeOnly: 'Nur abschließen ({{amount}} bereits erstattet, keine weitere Erstattung)',
        markReturned: 'Ware ist zurück (Bestellung → „Retourniert“)',
        notify: 'Erstattungsbestätigung per E-Mail senden',
        closeFailed:
          'Die Bestellung ist aktualisiert, aber der Widerruf konnte nicht abgeschlossen werden ({{message}}) – nochmals „Erstatten & abschließen“ drücken; dann wird nur abgeschlossen.',
      },
      status: {
        rejectReason: 'Begründung (intern)',
        rejectHint: 'Wird in der internen Notiz gespeichert. Den Kunden informieren Sie selbst.',
        reject: 'Ablehnen',
        rejectedNote: 'Abgelehnt am {{date}}: {{reason}}',
      },
      guide: {
        title: 'Nächster Schritt',
        step: {
          assign:
            'Bestellung zuordnen („Bestellung zuordnen“) oder den Widerruf nach Prüfung löschen – spätestens bis {{date}}.',
          close:
            'Die Bestellung ist bereits erstattet → „Erstatten & abschließen“ schließt den Widerruf ab.',
          refundNotShipped:
            'Noch nicht versendet → „Erstatten & abschließen“ (storniert auch die Bestellung).',
          refundNothingToWait: 'Es gibt nichts mehr abzuwarten → „Erstatten & abschließen“.',
          partial:
            '{{amount}} bereits erstattet (z. B. über „Status aktualisieren“ der Bestellung oder im Stripe-Dashboard) → „Erstatten & abschließen“: den Rest erstatten oder nur abschließen.',
          wait: 'Auf die Ware warten (Status „In Bearbeitung“ setzen). Sobald sie zurück ist oder der Versand nachgewiesen wird → „Erstatten & abschließen“ (vollständig oder teilweise).',
          done: '{{amount}} erstattet, zuletzt am {{date}}.',
          doneNoAmount: 'Erstattet.',
          rejected: 'Als abgelehnt abgeschlossen (siehe interne Notiz).',
          noOrder: 'Die verknüpfte Bestellung wurde nicht gefunden.',
        },
        deadline:
          'Erstattung bis {{date}} (14 Tage ab Eingang des Widerrufs). Zurückhalten erlaubt, bis die Ware zurück ist oder der Versand nachgewiesen wird.',
        overdue: 'Überfällig seit {{date}}',
        howTo: {
          summary: 'So geht’s',
          assign:
            'Nicht zugeordnet: über „Bestellung zuordnen“ der richtigen Bestellung zuordnen (Bestätigung an die E-Mail der Bestellung) – oder nach Prüfung löschen, spätestens nach 30 Tagen. Falsch zugeordnet: „Zuordnung aufheben“.',
          notShipped:
            'Noch nicht versendet: „Erstatten & abschließen“ – erstattet alles und storniert die Bestellung.',
          shipped:
            'Versendet oder zugestellt: Status „In Bearbeitung“ setzen und auf die Ware warten. Ist sie zurück (oder der Versand nachgewiesen): „Erstatten & abschließen“, vollständig oder teilweise (z. B. Abzug für eine geöffnete Flasche), und „Ware ist zurück“ anhaken.',
          partial:
            'Eine Teilerstattung schließt den Widerruf ab – der Rest wird nicht erstattet. Wurde schon etwas erstattet, „Nur abschließen“ wählen oder den Rest erstatten.',
          reject:
            'Kein Widerrufsrecht: Status „Abgelehnt“ mit Begründung (intern). Den Kunden informieren Sie selbst.',
          deadline:
            'Frist: Erstattung innerhalb von 14 Tagen ab Eingang des Widerrufs. Zurückhalten ist erlaubt, bis die Ware zurück ist oder der Versand nachgewiesen wird.',
        },
      },
    },
    refund: {
      title: 'Rückerstattung',
      refund: 'Rückerstatten',
      refunding: 'Rückerstatten...',
      alreadyRefunded: 'Diese Bestellung wurde bereits rückerstattet',
      error: 'Fehler während der Rückerstattung: {{message}}',
      sendRefundSuccess: 'Rückerstattung erfolgreich',
      changedMeanwhile:
        'Die Bestellung wurde inzwischen geändert – Dialog schließen und neu öffnen',
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
