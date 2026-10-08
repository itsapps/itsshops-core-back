/* eslint-disable @typescript-eslint/naming-convention, camelcase */
export default {
  constants: {
    bottleVolume: {
      '100': 'Zehntel Liter',
      '187': 'Quarter Litre-Split',
      '200': 'Piccolo',
      '250': 'Quarter Litre',
      '375': 'Halbflasche',
      '500': 'Halbliter',
      '750': 'Standard Flasche',
      '1000': 'Liter',
      '1500': 'Magnum',
      '2000': 'Doppler',
      '2250': 'Marie-Jeanne',
      '3000': 'Doppelmagnum',
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
      internal: 'Interne Verlinkung',
      external: 'Externe Verlinkung',
      submenu: 'Untermenü',
      system: 'Systemseite',
    },
  },
  groups: {
    product: 'Produkt',
    description: 'Beschreibung',
    stock: 'Lagerstand',
    pricing: 'Preise',
    media: 'Medien',
    seo: 'SEO',
    filters: 'Produktfilter',
    variants: 'Varianten',
    wine: 'Wein',
    variant: 'Variante',
    bundle: 'Pakete',
    general: 'Allgemeines',
    address: 'Adresse',
    vinofact: 'Vinofact',
    content: 'Inhalt',
    images: 'Bilder',
    settings: 'Einstellungen',
    vat: 'Steuer',
    order: 'Bestellung',
    orderPayment: 'Zahlung',
    orderItems: 'Produkte',
    orderCustomer: 'Kundendaten',
    orderTotals: 'Kosten',
    orderVouchers: 'Gutscheine',
    orderCoupons: 'Rabattcodes',
    orderFreeProducts: 'Goodies',
    infos: 'Informationen',
  },
  fieldsets: {},
  fields: {
    specifications: {
      title: 'Produktdetails',
      description: 'Eigenschaften wie Material oder Schnitt, auf der Produktseite als Liste angezeigt (z. B. „Material: 100% Baumwolle“).',
    },
    kind: {
      title: 'Produktart',
      options: {
        wine: 'Wein',
        physical: 'Waren',
        digital: 'Digital',
        bundle: 'Paket',
      },
    },
    disabled: {
      title: 'Inaktiv',
    },
    internalLinkTitle: {
      title: 'Titel',
    },
    internalLinkReference: {
      title: 'Referenz',
    },
    externalLinkTitle: {
      title: 'Titel',
    },
    externalLinkUrl: {
      title: 'Link',
      description:
        'Für Emails "mailto:hallo@beispiel.com", für Telefonnummern "tel:+4365012345678"',
    },
    externalLinkBlank: {
      title: 'In neuem Fenster öffnen',
    },
    url: {
      title: 'URL',
    },
    internalLinkSystemPage: {
      title: 'Systemseite',
      description: 'Alternativ zur Referenz: eine feste Shop-Seite, z. B. das Widerrufsformular.',
      options: {
        orderWithdraw: 'Widerruf',
      },
    },
    internalLinkDisplayType: {
      title: 'Anzeigetyp',
      options: {
        link: 'Link',
        button: 'Button',
        ghost: 'Ghost',
      },
    },
    locale: {
      title: 'Sprache',
    },
    contactEmail: {
      title: 'Kontakt-Email',
    },
    email: {
      title: 'Email',
    },
    supabaseId: {
      title: 'Externe User-ID (Supabase)',
    },
    prename: {
      title: 'Vorname',
    },
    lastname: {
      title: 'Nachname',
    },
    phone: {
      title: 'Telefonnummer',
    },
    line1: {
      title: 'Addresszeile 1',
    },
    line2: {
      title: 'Addresszeile 2',
    },
    city: {
      title: 'Stadt',
    },
    zip: {
      title: 'Postleitzahl',
    },
    country: {
      title: 'Land',
    },
    state: {
      title: 'Bundesland',
    },
    countries: {
      title: 'Länder',
    },
    address: {
      title: 'Adresse',
    },
    enabled: {
      title: 'Aktiviert',
    },
    countryCode: {
      title: 'Land',
    },
    freeShippingThreshold: {
      title: 'Gratisversand',
      description:
        'Für Bestellungen mit einem Wert oberhalb dieses Brutto-Betrags ist der Versand gratis.',
    },
    freeShippingCalculation: {
      title: 'Gratis-Versand Berechnung',
      description: 'Soll der Gratis Versand vor oder nach der Rabattierung berechnet werden?',
    },
    title: {
      title: 'Titel',
    },
    description: {
      title: 'Beschreibung',
    },
    image: {
      title: 'Bild',
    },
    alt: {
      title: 'Alternativer Text',
    },
    slug: {
      title: 'URL-Name',
      description:
        'Kleinbuchstaben, keine Leerzeichen. "/" für verschachtelte Pfade, z. B. infos/firma',
      validation: 'Erlaubte Zeichen: "a-z" "A-Z" "0-9" "-" "_"',
    },
    modules: {
      title: 'Inhalte',
    },
    sku: {
      title: 'SKU',
    },
    weight: {
      title: 'Gewicht (g)',
    },
    taxCategory: {
      title: 'Steuerklasse',
    },
    manufacturers: {
      title: 'Hersteller',
    },
    categories: {
      title: 'Kategorien',
    },
    tags: {
      title: 'Tags',
    },
    seo: {
      title: 'SEO',
    },
    stock: {
      title: 'Lagerstand',
    },
    stockThreshold: {
      title: 'Unteres Limit für Benachrichtigungen über den Lagerbestand',
      description:
        'Erhalte eine Benachrichtigung, wenn der Lagerbestand des Produktes unter diesem Limit liegt.',
    },
    compareAtPrice: {
      title: 'Vergleichspreis',
    },
    price: {
      title: 'Preis',
    },
    images: {
      title: 'Bilder',
    },
    vinofactWineId: {
      title: 'Wein',
      description: 'Verbindet dieses Produkt mit einem Vinofact Wein',
    },
    content: {
      title: 'Inhalt',
    },
    paymentIntentId: {
      title: 'Stripe Payment Intent ID',
    },
    totals: {
      title: 'Kostenübersicht',
    },
    customer: {
      title: 'Kundendaten',
    },
    orderItems: {
      title: 'Produkte',
    },
    billingAddress: {
      title: 'Rechnungsadresse',
    },
    shippingAddress: {
      title: 'Versandadresse',
    },
    vouchers: {
      title: 'Gutscheine',
    },
    appliedCoupons: {
      title: 'Eingelöste Rabattcodes',
    },
    freeProducts: {
      title: 'Geschenke',
    },
  },
  block: {
    styles: {
      normal: 'Normal',
      h1: 'Überschrift 1',
      h2: 'Überschrift 2',
      h3: 'Überschrift 3',
      h4: 'Überschrift 4',
      h5: 'Überschrift 5',
      h6: 'Überschrift 6',
    },
    marks: {
      decorators: {
        strong: 'Fett',
        em: 'Kursiv',
        underline: 'Unterstrichen',
        'strike-through': 'Durchgestrichen',
        code: 'Code',
        internalLink: 'Interne Verlinkung',
        externalLink: 'Externe Verlinkung',
        highlight: 'Hervorheben',
      },
      annotations: {
        underline: 'Unterstrichen',
        strikethrough: 'Durchgestrichen',
        code: 'Code',
        link: 'Link',
        highlight: 'Hervorheben',
        internalLink: 'Interne Verlinkung',
        externalLink: 'Externe Verlinkung',
      },
    },
  },
  orderings: {
    asc: 'Aufsteigend',
    desc: 'Absteigend',
  },
  validation: {
    assetRequired: 'Bild ist erforderlich',
    maxLength: 'Wert darf nicht mehr als {{max}} Zeichen enthalten',
    minLength: 'Wert muss mindestens {{min}} Zeichen enthalten',
    oneFieldMustExist: 'Mindestens eines erforderlich',
    requiredField: 'Erforderlich',
    recommendedField: 'Empfohlen',
    companyDetailsRecommended: 'Empfohlen – wird für Rechnungen und rechtliche Angaben in E-Mails verwendet',
    withdrawalUnmatchedWithOrder: 'Ein zugeordneter Widerruf kann nicht „Nicht zugeordnet“ sein.',
    withdrawalOrderHasOpen: 'Diese Bestellung hat bereits einen offenen Widerruf.',
    deliveryMethodsAtLeastOneRate: 'Es muss zumindest eine Regel definiert sein.',
    menuMaxDepthExceeded: 'Menüs können maximal {{maxDepth}} Schichten haben.',
    countryCodeNoDuplicates: 'Für {{countryCode}} gibt es bereits eine Konfiguration.',
    duplicateVolume: 'Jedes Volumen darf nur einmal vorkommen.',
    slugFormat:
      'Nur Kleinbuchstaben, Zahlen und "-" ("/" für verschachtelte Pfade). Leerzeichen und Großbuchstaben werden in der URL automatisch entfernt.',
  },

  productFieldsets: {
    states: 'Stati',
  },
  product: {
    title: 'Produkt',
    fields: {
      description: {
        title: 'Beschreibung',
        description: "Wird auf der Produktseite angezeigt. Leerzeilen trennen Absätze. Bei Weinen ersetzt sie die Vinofact-Beschreibung.",
      },
      variants: {
        title: 'Produktvarianten',
        description: 'Alle Varianten generiert durch Produktoptionen',
      },
      weight: {
        title: 'Gewicht',
        description:
          'Gewicht in Gramm. Wird verwendet, wenn eine Variante kein Gewicht gesetzt hat.',
      },
    },
    preview: {
      variants_one: '{{count}} Variante',
      variants_other: '{{count}} Varianten',
    },
  },
  productVariant: {
    title: 'Produktvariante',
    fields: {
      description: {
        title: 'Beschreibung',
        description: "Ersetzt die Beschreibung des Produkts für diese Variante. Leer lassen, um die des Produkts zu verwenden.",
      },
      specifications: {
        title: 'Produktdetails',
        description: "Ersetzt die Produktdetails des Produkts für diese Variante. Leer lassen, um die des Produkts zu verwenden.",
      },
      coverImage: {
        title: 'Cover-Bild',
        description:
          'Cover-Bild für diese Variant auswählen. Hat keinen Effekt, wenn die Variante eigene Bilder verwendet.',
      },
      options: {
        title: 'Optionen',
      },
      product: {
        title: 'Produkt',
      },
      bundleItems: {
        title: 'Paketprodukte',
      },
      volume: {
        title: 'Volumen',
      },
      vintage: {
        title: 'Jahrgang',
      },
      wine: {
        title: 'Wein',
      },
      weight: {
        title: 'Gewicht',
        description:
          'Gewicht in Gramm. Wenn gesetzt, wird es statt dem Gewicht des Produkts verwendet.',
      },
      status: {
        title: 'Status',
        options: {
          active: '🟢 Aktiv',
          comingSoon: '🟡 Kommt bald/Teaser',
          soldOut: '🔴 Ausverkauft (Sichtbar)',
          archived: '⚪ Archiviert',
        },
      },
    },
    preview: {
      variants: 'Varianten',
      bundleItems_zero: 'Keine Produkte',
      bundleItems_one: '{{count}} Produkt',
      bundleItems_other: '{{count}} Produkte',
    },
  },
  wine: {
    title: 'Wein',
    fields: {
      vinofactWineId: {
        title: 'Vinofact-Wein',
        description: 'Verbindet dieses Produkt mit einem Vinofact Wein',
      },
      volume: {
        title: 'Volumen',
      },
      vintage: {
        title: 'Jahrgang',
      },
    },
  },
  productSpecification: {
    title: 'Produktdetail',
    fields: {
      label: {
        title: 'Bezeichnung',
      },
      value: {
        title: 'Wert',
      },
    },
  },
  bundleItem: {
    title: 'Produkt',
    fields: {
      quantity: {
        title: 'Anzahl',
      },
      product: {
        title: 'Produkt',
      },
    },
    preview: {
      quantity_zero: 'Keine Produkte',
      quantity_one: '{{count}} Produkt',
      items_other: '{{count}} Produkte',
    },
  },
  category: {
    title: 'Kategorie',
    fields: {
      sortOrder: {
        title: 'Sortierung',
        description: 'Je kleiner die Zahl, desto früher wird die Kategorie angezeigt.',
      },
      parent: {
        title: 'Übergeordnete Kategorie',
      },
      filters: { title: 'Filter' },
    },
  },
  manufacturer: {
    title: 'Hersteller',
    fields: {
      name: {
        title: 'Name',
      },
      link: {
        title: 'Link',
      },
    },
  },
  textBlock: {
    title: 'Text Block',
    fields: {
      content: {
        title: 'Inhalt',
      },
      content2: {
        title: 'Inhalt 2',
        block: {
          styles: {},
        },
      },
    },
  },
  shippingMethod: {
    title: 'Versandart',
    fields: {
      deliveryTime: {
        title: 'Lieferzeit',
        description: 'Optional, z. B. „2–4 Werktage“. Steht in der Bestellbestätigung.',
      },
      rates: {
        title: 'Preistabelle (Gewicht)',
      },
      methodType: {
        title: 'Typ',
        options: {
          delivery: 'Versand',
          pickup: 'Abholung',
        },
      },
      packagingConfigs: {
        title: 'Weinverpackung',
      },
      pickupFee: {
        title: 'Kosten für die Abholung',
        description: 'Auf 0 setzen, um die Abholung kostenlos zu machen.',
      },
      eligibleCountries: {
        title: 'Länder',
      },
    },
    preview: {
      countries_zero: 'Keine Länder ausgewählt',
      countries_one: '{{count}} Land',
      countries_other: '{{count}} Länder',
    },
  },
  winePackage: {
    title: 'Paket',
    fields: {
      count: { title: 'Flaschen pro Paket' },
      price: { title: 'Preis', description: 'Brutto-Preis' },
    },
  },
  winePackagingConfig: {
    title: 'Volumen-Konfiguration',
    fields: {
      volume: { title: 'Flaschengröße' },
      packages: { title: 'Pakete' },
    },
  },
  shippingRate: {
    title: 'Kosten',
    fields: {
      price: {
        description: 'Brutto-Preis',
      },
      maxWeight: {
        title: 'Maximales Gewicht',
        description: 'Bis zu Gewicht (kg)',
      },
    },
  },
  taxCountry: {
    title: 'Land',
    fields: {
      rules: {
        title: 'Steuersätze',
      },
      freeShippingCalculation: {
        options: {
          beforeDiscount: 'Vor Rabatt',
          afterDiscount: 'Nach Rabatt',
        },
      },
    },
    preview: {
      rules_zero: 'Keine Steuersätze ausgewählt',
      rules_one: '{{count}} Steuersatz',
      rules_other: '{{count}} Steuersätze',
    },
  },
  shopSettings: {
    title: 'Allgemeine Shop-Einstellungen',
    fields: {
      filters: { title: 'Globale Filter' },
      defaultCountry: {
        title: 'Standard Land',
        description: 'Welches Land soll beim Checkout standardmäßig verwendet werden?',
      },
      defaultTaxCategory: {
        title: 'Standard Steuerklasse',
        description: 'Falls ein Produkt keine Steuerklasse hat, wird diese verwendet.',
      },
      freeShippingCalculation: {
        options: {
          beforeDiscount: 'Vor Rabatt',
          afterDiscount: 'Nach Rabatt',
        },
      },
      stockThreshold: {
        title: 'Allgemeines unteres Limit für Benachrichtigungen über den Lagerbestand',
        description:
          'Erhalte eine Benachrichtigung mit dem Lagerbestand eines Produktes unter diesem Limit.',
      },
      billingAddress: {
        title: 'Rechnungsadresse',
        description: 'Falls abweichend von der Unternehmensadresse',
      },
      bankAccount: {
        title: 'Bankdaten',
        description: 'Werden für Rechnungen verwendet',
      },
      orderNumberPrefix: {
        title: 'Bestellnummer-Präfix',
        description: 'Benutzt als Präfix der Bestellnummer, z.B. "ORD-00000001',
      },
      invoiceNumberPrefix: {
        title: 'Rechnungsnummer-Präfix',
        description: 'Benutzt als Präfix der Rechnungsnummer, z.B. "INV-00000001',
      },
      lastInvoiceNumber: {
        title: 'Letzte Rechnungsnummer',
        description:
          'Achtung! Dieser Wert wird automatisch erhöht und sollte nicht manuell geändert werden.',
      },
      shopPage: {
        title: 'Shopseite',
        description: 'Diese Seite wird als Haupseite des Shops verwendet.',
      },
      termsPage: {
        title: 'AGB',
        description: 'Diese Seite beschreibt die allgemeinen Geschäftsbedingungen.',
      },
      withdrawalPolicyPage: {
        title: 'Widerrufsbelehrung',
        description:
          'Seite mit dem Modul „Widerrufsbelehrung“ – Belehrung und Muster-Formular werden aus den Einstellungen erzeugt.',
      },
      shippingInfoPage: {
        title: 'Versand & Zahlung',
        description:
          'Seite mit dem Modul „Versand & Zahlung“. Wird am Beginn der Kasse und über dem Bestell-Button verlinkt.',
      },
      returnAddress: {
        title: 'Retourenadresse',
        description:
          'Wohin Kunden widerrufene Ware zurücksenden. Ohne Angabe wird die Rechnungsadresse verwendet.',
      },
      returnShippingBorneBy: {
        title: 'Rücksendekosten trägt',
        description:
          'Wer die Kosten der Rücksendung trägt. "Kunde" ist nur durchsetzbar, wenn in der Widerrufsbelehrung angegeben.',
        options: {
          customer: 'Kunde',
          merchant: 'Händler',
        },
      },
      returnPolicyNote: {
        title: 'Hinweis zur Rücksendung',
        description:
          'Optionaler Zusatzhinweis (z. B. „Bitte in versandgeeigneter Verpackung zurücksenden“) – erscheint neben der Widerrufsbelehrung (Seite und Bestellbestätigung) und in der Widerrufs-Bestätigung.',
      },
      withdrawalPeriodStart: {
        title: 'Beginn der Widerrufsfrist',
        description: 'Wählt den gesetzlichen Textbaustein der Widerrufsbelehrung.',
        options: {
          goods: 'Erhalt der Ware (immer eine Lieferung)',
          multipleGoods: 'Erhalt der letzten Ware (Bestellung kann in mehreren Paketen kommen)',
          partialDeliveries: 'Erhalt der letzten Teilsendung (eine Ware in mehreren Teilsendungen)',
          subscription: 'Erhalt der ersten Ware (regelmäßige Lieferung, Abo)',
        },
      },
      withdrawalExceptions: {
        title: 'Ausnahmen vom Widerrufsrecht',
        description:
          'Nur ankreuzen, was auf Waren in diesem Shop tatsächlich zutrifft – jede Auswahl wird auf der Widerrufsseite und in jeder Bestellbestätigung als „kein Widerrufsrecht“ angeführt (§ 18 FAGG). Für einen normalen Weinverkauf trifft in der Regel keine Ausnahme zu. Im Zweifel mit der WKO bzw. Rechtsberatung klären.',
        options: {
          customMade: 'Personalisiert / nach Kundenwunsch angefertigt – z. B. gravierte Flaschen, individuelle Etiketten',
          perishable: 'Schnell verderblich – z. B. frische Lebensmittel (nicht Wein)',
          sealedHygiene: 'Versiegelt, aus Hygienegründen nicht rückgabefähig – nur nach geöffneter Versiegelung, z. B. Kosmetik',
          mixed: 'Nach Lieferung untrennbar mit anderen Gütern vermischt – selten relevant',
          alcoholMarketPrice: 'Subskription / En primeur – Wein zu heute fixem Preis, Lieferung frühestens 30 Tage später, Preis vom Markt abhängig',
          sealedMedia: 'Versiegelte Ton-/Videoaufnahmen oder Software – nur nach geöffneter Versiegelung',
          newspapers: 'Zeitungen, Zeitschriften – außer Abonnements',
        },
      },
    },
    groups: {
      displays: 'Anzeigen',
      shipping: 'Versand',
      returns: 'Retouren',
      stock: 'Lagerbestand',
      tax: 'Steuern',
      orders: 'Bestellungen',
      billing: 'Rechnungen',
    },
    preview: {},
  },
  bankAccount: {
    title: 'Bank',
    fields: {
      name: {
        title: 'Bankname',
      },
      iban: {
        title: 'IBAN',
      },
      bic: {
        title: 'BIC',
      },
    },
  },
  generatedZip: {
    title: 'ZIP-Archiv',
    noZip: 'Noch kein ZIP erzeugt',
    fields: {
      file: { title: 'Datei' },
      generatedAt: { title: 'Erzeugt am' },
    },
  },
  company: {
    title: 'Organisation',
    fields: {
      name: {
        title: 'Firmenname',
      },
      owner: {
        title: 'Firmenbesitzer',
      },
      address: {
        title: 'Adresse',
      },
      email: {
        title: 'E-Mail',
      },
      phone: {
        title: 'Telefon',
      },
      vatId: {
        title: 'UID-Nummer',
      },
      registerNumber: {
        title: 'Firmenbuchnummer',
        description: 'Nur wenn im Firmenbuch eingetragen. Erscheint in E-Mails.',
      },
      registerCourt: {
        title: 'Firmenbuchgericht',
        description: 'Nur wenn im Firmenbuch eingetragen.',
      },
    },
  },
  taxRule: {
    title: 'Regel',
    fields: {
      rate: {
        title: 'Steuersatz in %',
      },
    },
    preview: {
      rate: ' Steuersatz',
    },
  },
  taxCategory: {
    title: 'Steuerklasse',
    fields: {
      title: {
        description: 'Name der Klasse (z.b. "Standard, Alkohol, ...")',
      },
      code: {
        title: 'Code',
        description: 'Der Code wird verwendet, um die Steuerklasse zu identifizieren.',
      },
    },
    preview: {},
  },
  address: {
    title: 'Adresse',
    fields: {},
  },
  addressStrict: {
    title: 'Adresse',
    fields: {
      name: {
        title: 'Voller Name',
      },
    },
  },
  businessAddress: {
    title: 'Adresse',
    fields: {},
  },
  orderTotals: {
    title: 'Kosten',
    fieldsets: {
      vat: 'Steuern',
    },
    fields: {
      grandTotal: {
        title: 'Gesamtsumme (brutto)',
        description: 'Der vom Kunden bezahlte Endbetrag',
      },
      subtotal: {
        title: 'Zwischensumme',
        description: 'Summe aller Bestellpositionen (brutto)',
      },
      shipping: {
        title: 'Versandkosten',
      },
      discount: {
        title: 'Rabatt',
      },
      totalVat: {
        title: 'Steuern Gesamt',
        description: 'Summe aller Steuern aus Positionen und Versand',
      },
      vatBreakdown: {
        title: 'Steueraufstellung',
        description: 'Steuern gruppiert nach Steuersatz (z.B. 10% vs. 20%)',
      },
      currency: {
        title: 'Währung',
      },
    },
  },
  orderWithdrawal: {
    title: 'Widerruf',
    fields: {
      orderRef: {
        title: 'Bestellung',
        description:
          'Nicht zugeordnet: passende Bestellung auswählen (danach veröffentlichen und „Bestätigung erneut senden“) oder den Widerruf nach Prüfung löschen – spätestens nach 30 Tagen.',
      },
      declaredAt: { title: 'Erklärt am' },
      status: {
        title: 'Status',
        description:
          'Nicht zugeordnet: einer Bestellung zuordnen oder nach Prüfung löschen (spätestens nach 30 Tagen).',
        options: {
          unmatched: 'Nicht zugeordnet',
          received: 'Eingegangen',
          processing: 'In Bearbeitung',
          refunded: 'Erstattet',
          rejected: 'Abgelehnt',
        },
      },
      name: { title: 'Name (angegeben)' },
      email: { title: 'E-Mail (angegeben)' },
      orderNumber: { title: 'Bestellnummer (angegeben)' },
      locale: { title: 'Sprache' },
      reason: { title: 'Grund / betroffene Artikel' },
      note: { title: 'Interne Notiz' },
    },
    preview: {
      title: 'Widerruf #{{orderNumber}}',
    },
  },
  order: {
    title: 'Bestellung',
    groups: {
      order: 'Bestellung',
      history: 'Statusverlauf',
      orderPayment: 'Zahlung',
      orderItems: 'Positionen',
      orderCustomer: 'Kunde',
      orderTotals: 'Kosten',
      fulfillment: 'Versand',
      orderVouchers: 'Gutscheine',
      orderCoupons: 'Rabattcodes',
      orderFreeProducts: 'Geschenke',
    },
    fields: {
      orderNumber: {
        title: 'Bestellnummer',
      },
      invoiceNumber: {
        title: 'Rechnungsnummer',
      },
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
      orderDate: {
        title: 'Bestelldatum',
        description: 'Zeitpunkt der Bestellung (Zahlungsbeginn), steht in der Bestellbestätigung.',
      },
      payment: {
        title: 'Zahlungsart',
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
        title: 'Statusverlauf',
      },
      paymentIntentId: {
        title: 'Stripe Payment Intent ID',
      },
      orderItems: {
        title: 'Positionen',
      },
      customer: {
        title: 'Kunde',
      },
      totals: {
        title: 'Kosten',
      },
      fulfillment: {
        title: 'Versand',
      },
    },
  },
  orderPaymentMethod: {
    title: 'Zahlungsart',
    fields: {
      type: { title: 'Typ' },
      brand: { title: 'Kartenmarke' },
      last4: { title: 'Letzte 4 Ziffern' },
      wallet: { title: 'Wallet' },
    },
  },
  orderStatusHistory: {
    title: 'Statusverlauf',
    fields: {
      type: {
        title: 'Typ',
        options: {
          payment: 'Zahlung',
          fulfillment: 'Versand',
        },
      },
      status: {
        title: 'Status',
      },
      timestamp: {
        title: 'Zeitpunkt',
      },
      source: {
        title: 'Quelle',
      },
      note: {
        title: 'Notiz',
      },
    },
  },
  orderCustomer: {
    title: 'Kundendaten',
    groups: {
      general: 'Allgemeines',
      billing: 'Rechnungsadresse',
      shipping: 'Versandadresse',
    },
    fields: {
      locale: {
        title: 'Sprache',
      },
      contactEmail: {
        title: 'Kontakt-Email',
      },
      supabaseId: {
        title: 'Supabase Benutzer-ID',
      },
      billingAddress: {
        title: 'Rechnungsadresse',
      },
      shippingAddress: {
        title: 'Versandadresse',
      },
    },
  },
  orderItem: {
    title: 'Bestellposition',
    fields: {
      kind: {
        title: 'Art',
      },
      variantId: {
        title: 'Varianten-ID',
      },
      productId: {
        title: 'Produkt-ID',
      },
      parentId: {
        title: 'Übergeordnete Position',
        description:
          'Bei Bundle-Unterpositionen gesetzt — verweist auf den orderItem._key des übergeordneten Bundles',
      },
      title: {
        title: 'Produkttitel',
        description: 'Bei der Bestellung gespeicherter Produkttitel',
      },
      variantTitle: {
        title: 'Variantentitel',
        description: 'Bei der Bestellung gespeicherter Variantentitel',
      },
      displayTitle: {
        title: 'Anzeigetitel',
        description:
          'Eingefrorener Anzeigetext, den der Kunde bei der Bestellung gesehen hat — verbindlich für Rechnungen, E-Mails, Bestellhistorie und WC-API. Niemals neu zusammensetzen.',
      },
      displaySubtitle: {
        title: 'Anzeige-Untertitel',
        description:
          'Eingefrorener Untertitel, den der Kunde bei der Bestellung gesehen hat (optional).',
      },
      weight: {
        title: 'Gewicht',
        description: 'Gewicht in Gramm zum Bestellzeitpunkt',
      },
      sku: {
        title: 'SKU',
      },
      quantity: {
        title: 'Menge',
      },
      price: {
        title: 'Einzelpreis',
        description: 'Einzelpreis in Cent',
      },
      vatRate: {
        title: 'Steuersatz',
        description: 'Steuersatz in Prozent, z.B. 20 für 20%',
      },
      vatAmount: {
        title: 'Steuerbetrag',
        description: 'Gesamte Steuer dieser Position in Cent (Menge × Einzelsteuer)',
      },
      packed: {
        title: 'Verpackt',
      },
      wine: {
        title: 'Weindaten',
      },
      options: {
        title: 'Optionen',
        description: 'Eingefrorene Optionsgruppe/Wert-Paare',
      },
      bundle: {
        title: 'Bundle',
      },
    },
  },
  orderItemWine: {
    title: 'Wein',
    fields: {
      vintage: {
        title: 'Jahrgang',
      },
      volume: {
        title: 'Volumen',
        description: 'Volumen in ml',
      },
    },
  },
  orderItemBundle: {
    title: 'Bundle',
    fields: {
      itemCount: {
        title: 'Anzahl Positionen',
        description: 'Gesamtmenge aller untergeordneten Positionen',
      },
    },
  },
  orderItemOption: {
    title: 'Option',
    fields: {
      groupTitle: {
        title: 'Gruppe',
      },
      optionTitle: {
        title: 'Option',
      },
    },
  },
  fulfillment: {
    title: 'Versand',
    fields: {
      methodTitle: {
        title: 'Versandart',
        description: 'Eingefrorener Titel (z.B. "DHL Express" oder "Selbstabholung")',
      },
      deliveryTime: {
        title: 'Lieferzeit',
        description: 'Eingefrorene Lieferzeit der Versandart zum Bestellzeitpunkt',
      },
      methodType: {
        title: 'Typ',
        options: {
          delivery: 'Lieferung',
          pickup: 'Abholung',
        },
      },
      shippingCost: {
        title: 'Versandkosten',
        description: 'Die dem Kunden verrechneten Versandkosten',
      },
      taxSnapshot: {
        title: 'Versandsteuer',
      },
      method: {
        title: 'Versandart-Referenz',
        description: 'Verweis auf die ursprüngliche Konfiguration (kann sich später ändern)',
      },
      trackingCode: {
        title: 'Sendungsnummer',
      },
      pickupLocation: {
        title: 'Abholort',
        description: 'Adresse, an der die Ware abgeholt werden kann',
      },
    },
  },
  vatBreakdownItem: {
    title: 'Steueraufstellung',
    fields: {
      rate: {
        title: 'Satz %',
      },
      net: {
        title: 'Nettobetrag',
      },
      vat: {
        title: 'Steuerbetrag',
      },
    },
  },
  tag: {
    title: 'Tag',
  },
  customer: {
    title: 'Kunde',
    fields: {
      customerNumber: {
        title: 'Kundennummer',
      },
      customerGroups: {
        title: 'Kundengruppen',
      },
      status: {
        title: 'Registrierungsstatus',
        options: {
          registered: 'Registriert',
          invited: 'Eingeladen',
          active: 'Aktiv',
        },
      },
      locale: {
        title: 'Sprache',
      },
    },
  },
  newsletterSubscriber: {
    title: 'Newsletter-Abonnent',
    fields: {
      email: { title: 'E-Mail' },
      locale: { title: 'Sprache' },
      status: {
        title: 'Status',
        options: {
          pending: 'Ausstehend (Bestätigung offen)',
          confirmed: 'Bestätigt',
          unsubscribed: 'Abgemeldet',
        },
      },
      source: {
        title: 'Quelle',
        options: {
          standalone: 'Newsletter-Formular',
          registration: 'Kontoregistrierung',
        },
      },
      token: { title: 'Token' },
      supabaseId: { title: 'Supabase-ID' },
      confirmedAt: { title: 'Bestätigt am' },
    },
  },
  variantOptionGroup: {
    title: 'Optionengruppe',
    fields: {
      displayMode: {
        title: 'Darstellung',
        description: 'Wie die Optionen im Shop angezeigt werden.',
        options: {
          dropdown: 'Auswahlliste',
          list: 'Liste',
        },
      },
      sortOrder: {
        title: 'Sortierung',
        description: 'Je kleiner die Zahl, desto früher wird die Option angezeigt.',
      },
    },
  },
  variantOption: {
    title: 'Option',
    fields: {
      sortOrder: {
        title: 'Sortierung',
        description: 'Je kleiner die Zahl, desto früher wird die Option angezeigt.',
      },
      group: {
        title: 'Optionengruppe',
      },
    },
  },
  page: {
    title: 'Seite',
    groups: {
      page: 'Allgemeines',
    },
  },
  post: {
    title: 'Post',
    groups: {
      post: 'Allgemeines',
    },
    fields: {
      publishedAt: {
        title: 'Veröffentlichungsdatum',
      },
    },
  },
  blog: {
    title: 'Blog',
    groups: {
      blog: 'Allgemeines',
    },
    fields: {
      postsPerPage: {
        title: 'Einträge pro Seite',
      },
    },
  },
  link: {
    title: 'Link',
    fields: {
      href: {
        title: 'URL',
        description:
          'Für Emails "mailto:hallo@beispiel.com", für Telefonnummern "tel:+4365012345678"',
      },
      displayType: {
        title: 'Display Type',
        options: {
          text: 'Text',
          button: 'Button',
        },
      },
    },
  },
  internalLink: {
    title: 'Interne Verlinkung',
    fields: {
      reference: {
        title: 'Referenz',
      },
      displayType: {
        title: 'Anzeigetyp',
        options: {
          link: 'Link',
          button: 'Button',
        },
      },
    },
  },
  action: {
    title: 'Aktion',
    fields: {
      title: {
        title: 'Text',
      },
      internalLink: {
        title: 'Verlinkung',
      },
    },
  },
  multiColumns: {
    title: 'Spalten',
    preview: {
      columns: 'Spalte(n)',
    },
    fields: {
      headline: {
        title: 'Überschrift',
      },
      backgroundImage: {
        title: 'Hintergrundbild',
      },
      columns: {
        title: 'Spalten',
      },
    },
  },
  localeComplexPortable: {
    title: 'Inhalt',
    preview: {
      noContent: 'Keine Inhalte',
      image: 'Bild',
    },
    fields: {
      headline: {
        title: 'Überschrift',
      },
      backgroundImage: {
        title: 'Hintergrundbild',
      },
      columns: {
        title: 'Spalten',
      },
      translations: {
        title: 'Übersetzungen',
      },
    },
  },
  menu: {
    title: 'Menü',
    fields: {
      items: {
        title: 'Einträge',
      },
    },
  },
  menuItem: {
    title: 'Menüeintrag',
    fields: {
      linkType: {
        title: 'Typ',
        options: {
          internal: 'Interne Verlinkung',
          external: 'Externe Verlinkung',
          submenu: 'Untermenü',
          system: 'Systemseite',
        },
      },
      systemPage: {
        title: 'Systemseite',
        description: 'Feste Shop-Seite, z. B. das Widerrufsformular. Ohne Titel wird der Seitenname verwendet. Der Widerrufs-Link heißt immer „Vertrag widerrufen“ (gesetzlich vorgegeben, § 13a FAGG) – ein eigener Titel wird dort ignoriert.',
        options: {
          orderWithdraw: 'Vertrag widerrufen',
        },
      },
      children: {
        title: 'Einträge',
      },
    },
    preview: {
      noUrl: 'Keine URL',
      noReference: 'Keine Referenz',
      submenuItems_zero: 'Keine Einträge',
      submenuItems_one: '{{count}} Eintrag',
      submenuItems_other: '{{count}} Einträge',
    },
  },
  navPage: {
    title: 'Seite',
    fields: {
      page: {
        title: 'Seite',
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
    title: 'Allgemeine Einstellungen',
    groups: {
      site: 'Webseite',
      displays: 'Anzeigen',
      notifications: 'Benachrichtigungen',
      analytics: 'Statistiken',
      company: 'Firma',
    },
    fields: {
      senderName: {
        title: 'Absendername',
        description:
          'Wird als Absender bei E-Mails an Kunden verwendet (z.B. Newsletter, Konto-Bestätigung, Bestellungen).',
      },
      senderEmail: {
        title: 'Absender-E-Mail',
        description:
          'Wird als Absenderadresse bei E-Mails an Kunden verwendet (z.B. Newsletter, Konto-Bestätigung, Bestellungen).',
      },
      shopNotificationEmail: {
        title: 'Shop-Benachrichtigungen',
        description:
          'Empfänger der Shop-Kopie von Bestellbestätigungen und Widerrufen; leer = Absender-E-Mail.',
      },
      siteTitle: {
        title: 'Seitentitel',
        description:
          'Name deiner Seite, normalerweise dein Brand- oder Firmenname. Wird im Browser-Tab, in Social-Media-Vorschauen und im Web-App-Manifest verwendet.',
      },
      siteShortDescription: {
        title: 'Kurzbeschreibung',
        description:
          'Wird als Meta-Description in Suchergebnissen verwendet, wenn keine seitenspezifische SEO-Beschreibung gesetzt ist.',
      },
      defaultShareImage: {
        title: 'Standard-Vorschaubild',
        description:
          'Wird in Social-Media-Vorschauen (og:image) verwendet, wenn weder ein seitenspezifisches SEO-Bild noch ein Seitenbild vorhanden ist. Empfohlene Größe: 1200×630px.',
      },
      homePage: {
        title: 'Startseite',
        description: 'Diese Seite wird als Startseite angezeigt',
      },
      privacyPage: {
        title: 'Datenschutzerklärung',
        description: 'Diese Seite beschreibt die Datenschutzerklärung',
      },
      mainMenus: {
        title: 'Hauptmenüs',
        description: 'Diese Menüs werden in der Hauptnavigation angezeigt',
      },
      footerMenus: {
        title: 'Fußzeilenmenüs',
        description: 'Diese Menüs werden in der Fußzeile angezeigt',
      },
      gtmId: {
        title: 'Google Tag Manager (GTM)',
        description: 'Um GTM zu aktivieren, gib deine Container-ID ein',
      },
      company: {
        title: 'Firma',
      },
    },
  },
  customerGroup: {
    title: 'Kundengruppe',
  },
  coupon: {
    title: 'Rabattcode',
    fields: {
      code: {
        title: 'Code',
        description: 'Code, den der Kunde im Checkout eingibt.',
      },
      title: {
        title: 'Interner Titel',
      },
      description: {
        title: 'Interne Notiz',
      },
      enabled: {
        title: 'Aktiv',
      },
      discountType: {
        title: 'Ermässigungstyp',
        options: {
          percent: 'Prozent',
          fixed: 'Fixer Betrag',
          freeShipping: 'Gratisversand',
        },
      },
      value: {
        title: 'Wert',
        description: 'Prozent: 1–100. Fixer Betrag: in Cent (1000 = 10€).',
      },
      validFrom: {
        title: 'Gültig ab',
      },
      validTo: {
        title: 'Gültig bis',
      },
      minSubtotal: {
        title: 'Mindestbestellwert',
        description: 'Brutto-Mindestbetrag, ab dem der Code gilt.',
      },
      maxRedemptions: {
        title: 'Maximale Einlösungen',
        description: 'Globale Obergrenze. Leer = unbegrenzt.',
      },
      redemptionCount: {
        title: 'Bisherige Einlösungen',
      },
    },
    validation: {
      valueRequired: 'Wert ist erforderlich',
      valuePositive: 'Wert muss größer als 0 sein',
      percentMax: 'Prozent darf 100 nicht überschreiten',
      validToAfterFrom: '"Gültig bis" muss nach "Gültig ab" liegen',
      codeInUse: 'Code wird bereits verwendet',
    },
    preview: {
      badge: {
        active: '🟢 Aktiv',
        disabled: '⚪ Deaktiviert',
        expired: '🔴 Abgelaufen',
        scheduled: '🟡 Geplant',
        exhausted: '🔴 Verbraucht',
      },
      freeShipping: 'Gratisversand',
    },
  },
  appliedCoupon: {
    title: 'Eingelöster Rabattcode',
    fields: {
      couponRef: {
        title: 'Rabattcode',
      },
      code: {
        title: 'Code',
      },
      discountType: {
        title: 'Ermässigungstyp',
        options: {
          percent: 'Prozent',
          fixed: 'Fixer Betrag',
          freeShipping: 'Gratisversand',
        },
      },
      value: {
        title: 'Wert',
      },
      discountAmount: {
        title: 'Abgezogener Betrag',
        description: 'Tatsächlich abgezogener Betrag in Cent',
      },
    },
  },
  voucher: {
    title: 'Gutschein',
    validation: {
      mustHaveDiscountOrReward: 'Gutscheine müssen einen Rabatt oder eine Belohnung enthalten.',
    },
    fields: {
      active: {
        title: 'Aktiv',
      },
      code: {
        title: 'Gutschein Code',
        description:
          'Code, der vom Benutzer eingegeben werden muss, um den Gutschein zu nutzen. Wenn kein Code verwendet wird, wird der Gutschein automatisch angewendet.',
      },
      autoApply: {
        title: 'Automatisch anwenden',
        description:
          'Der Gutschein wird automatisch angewendet, falls alle Bedingungen erfüllt sind.',
      },
      discountType: {
        title: 'Ermässigungstyp',
        options: {
          none: 'Keiner',
          fixed: 'Fixer Betrag',
          percentage: 'Prozentueller Betrag',
        },
      },
      discountFixed: {
        title: 'Wert',
        description: 'Der Gutscheinbetrag wird vom Warenkorb abgezogen.',
      },
      discountPercentage: {
        title: 'Prozentsatz',
        description: 'Der Prozentsatz wird vom Warenkorb abgezogen.',
      },
      stackable: {
        title: 'Stapelbar',
        description: 'Kann mit anderen Gutscheinen zusammen verwendet werden.',
      },
      validFrom: {
        title: 'Gültig ab',
      },
      validUntil: {
        title: 'Gültig bis',
      },
      customerGroups: {
        title: 'Kundengruppen',
        description: 'Auf spezifische Kundengruppen beschränken.',
      },
      newCustomersOnly: {
        title: 'Nur für neue Kunden',
      },
      registeredCustomersOnly: {
        title: 'Nur für registrierte Kunden',
      },
      conditions: {
        title: 'Bedingungen',
      },
      rewards: {
        title: 'Belohnungen',
        product: {
          title: 'Produkt',
        },
        quantity: {
          title: 'Menge',
        },
      },
    },
  },
  voucherCondition: {
    title: 'Gutschein-Bedingung',
    fields: {
      type: {
        title: 'Bedingungstyp',
        options: {
          product: 'Spezifisches Produkt',
          category: 'Produktkategorie',
          totalValue: 'Mindestwert des Warenkorbs',
          quantity: 'Mindestmenge',
          userStatus: 'Kundenstatus',
        },
      },
      product: {
        title: 'Produkt',
      },
      category: {
        title: 'Kategorie',
      },
      minValue: {
        title: 'Mindestwert des Warenkorbs',
      },
      minQuantity: {
        title: 'Mindestmenge',
      },
      userStatus: {
        title: 'Kundenstatus',
        options: {
          registeredCustomer: 'Registrierter Kunde',
          newCustomer: 'Neuer Kunde',
        },
      },
      messages: {
        productRequired: 'Ein Produkt muß ausgewählt werden',
        categoryRequired: 'Eine Kategory muß ausgewählt werden',
        minValueRequired: 'Der Mindestwert muß gesetzt werden',
        quantityRequired: 'Die Mindestanzahl muß gesetzt werden',
        userStatusRequired: 'Der Kundenstatus muß ausgewählt werden',
      },
    },
  },
  seo: {
    title: 'SEO',
    fields: {
      metaTitle: {
        title: 'Meta-Titel',
        description: 'Titel für Suchmaschinen und Browser',
        validation: 'Titel länger als 50 werden von Suchmaschinen und Browsern abgeschnitten',
      },
      metaDescription: {
        title: 'Meta-Beschreibung',
        description: 'Beschreibung für Suchmaschinen',
        validation: 'Beschreibungen länger als 150 werden von Suchmaschinen abgeschnitten',
      },
      shareTitle: {
        title: 'Share-Titel',
        description: 'Titel für soziale Netzwerke. Wenn leer, wird der Meta-Titel verwendet',
        validation: 'Titel länger als 50 werden von sozialen Netzwerken abgeschnitten',
      },
      shareDescription: {
        title: 'Share-Beschreibung',
        description:
          'Beschreibung für soziale Netzwerke. Wenn leer, wird die Meta-Beschreibung verwendet',
        validation: 'Beschreibungen länger als 150 werden von sozialen Netzwerken abgeschnitten',
      },
      shareImage: {
        title: 'Share-Bild',
        description: 'Empfohlene Bildgröße: 1200x630px (PNG oder JPG)',
      },
    },
  },

  carousel: {
    title: 'Karussell',
    preview: {
      slides_zero: 'Keine Bilder',
      slides_one: '{{count}} Bild',
      slides_other: '{{count}} Bilder',
    },
    fields: {
      slides: {
        title: 'Bilder',
      },
      autoplay: {
        title: 'Autoplay',
      },
      autoplayDelay: {
        title: 'Autoplay-Verzögerung',
        description: 'Nächstes Bild wird nach den angegebenen Sekunden angezeigt.',
      },
      loop: {
        title: 'Wiederholen',
      },
      fade: {
        title: 'Fade',
        description: 'Fade-Animationen anstatt Bewegung beim Wechsel der Slides.',
      },
      preload: {
        title: 'Vorladen',
        description:
          'Erstes Bild vorladen - aktivieren, wenn das Karussell beim Laden der Seite sichtbar ist.',
      },
    },
  },
  categoryList: {
    title: 'Kategorienliste',
    fields: {
      title: { title: 'Titel' },
      categories: { title: 'Kategorien' },
    },
    preview: {
      categories_zero: 'Keine Kategorien',
      categories_one: '{{count}} Kategorie',
      categories_other: '{{count}} Kategorien',
    },
  },
  productList: {
    title: 'Produktliste',
    fields: {
      title: { title: 'Titel' },
      filters: { title: 'Filter' },
      products: { title: 'Produkte' },
    },
    wineFieldFilter: {
      title: 'Wein-Filter',
      fields: {
        field: {
          title: 'Feld',
          options: {
            vintage: 'Jahrgang',
            varietal: 'Rebsorte',
            color: 'Farbe',
            classification: 'Klassifikation',
            qualityGrade: 'Qualitätsstufe',
            volume: 'Flaschengröße',
          },
        },
      },
    },
    productFieldFilter: {
      title: 'Produkt-Filter',
      fields: {
        field: {
          title: 'Feld',
          options: {
            price: 'Preis',
            category: 'Kategorie',
          },
        },
      },
    },
    preview: {
      filter: 'Filter',
      filters_zero: 'Keine Filter',
      filters_one: '{{count}} Filter',
      filters_other: '{{count}} Filter',
      product: 'Produkt',
      products_zero: 'Keine Produkte',
      products_one: '{{count}} Produkt',
      products_other: '{{count}} Produkte',
    },
  },
  productVariantList: {
    title: 'Produktvariantenliste',
    fields: {
      title: { title: 'Titel' },
      products: { title: 'Varianten' },
    },
  },
  withdrawalPolicyModule: {
    title: 'Widerrufsbelehrung (automatisch)',
  },
  shippingInfoModule: {
    title: 'Versand & Zahlung (automatisch)',
  },
  youtube: {
    title: 'YouTube',
    fields: {
      url: {
        title: 'Url',
        description: 'YouTube Video URL oder ID',
      },
      showControls: {
        title: 'Steuerleiste anzeigen',
      },
      start: {
        title: 'Starten bei',
        description: 'Video an bestimmtem Zeitpunkt starten (in Sekunden)',
      },
      autoload: {
        title: 'Automatisch laden',
        description: 'Video automatisch laden, wenn es sichtbar wird',
      },
      autopause: {
        title: 'Automatisch pausieren',
        description: 'Video automatisch pausieren, wenn es nicht mehr sichtbar ist',
      },
    },
  },

  localeBlock: {
    title: 'Lokalisierter Block',
    translations: {
      title: 'Übersetzungen',
    },
  },
  localeImage: {
    title: 'Bild (Mehrsprachig)',
  },
  localeAltImage: {
    title: 'Bild',
  },
  baseImage: {
    title: 'Bild',
  },
  localeString: {
    title: 'Lokalisierter Text',
    translations: {
      title: 'Übersetzungen',
    },
    validations: {
      allExist: 'Alle Lokalisierungen müssen vorhanden sein.',
    },
  },
  localeSlug: {
    title: 'Lokalisierter URL-Name',
    translations: {
      title: 'Übersetzungen',
    },
  },
}
