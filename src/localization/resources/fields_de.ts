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
    },
  },
  groups: {
    product: 'Produkt',
    description: 'Beschreibung',
    stock: 'Lagerstand',
    pricing: 'Preise',
    media: 'Medien',
    seo: 'SEO',
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
    orderFreeProducts: 'Goodies',
    infos: 'Informationen',
  },
  fieldsets: {},
  fields: {
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
  },

  productFieldsets: {
    states: 'Stati',
  },
  product: {
    title: 'Produkt',
    fields: {
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
  productGrid: {
    title: 'Produktraster',
    fields: {
      title: { title: 'Titel' },
      products: { title: 'Produkte' },
    },
  },
  productVariant: {
    title: 'Produktvariante',
    fields: {
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
      featured: {
        title: 'Gefeatured',
        description:
          'Wenn ausgewählt, wird diese Variante in der Suche angezeigt. Wenn keine Variante gefeatured ist, wird automatisch die Erste verwendet.',
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
      parent: {
        title: 'Übergeordnete Kategorie',
      },
      sortOrder: {
        title: 'Reihenfolge',
        description: 'Umso niedriger die Zahl, desto höher die Kategorie in der Navigation',
      },
    },
  },
  manufacturer: {
    title: 'Hersteller',
    fields: {
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
      rates: {
        title: 'Preistabelle',
      },
      methodType: {
        title: 'Typ',
        options: {
          delivery: 'Versand',
          pickup: 'Abholung',
        },
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
      // title: {
      //   description: 'Name der Klasse (z.b. "Standard, Alkohol, ...")',
      // },
      // code: {
      //   title: 'Code',
      //   description: 'Der Code wird verwendet, um die Steuerklasse zu identifizieren und kann nur einmalig gesetzt werden.',
      //   // description: 'The code used by the system. Locked after publishing to prevent breaking the shop.',
      // },
    },
  },
  taxCountry: {
    title: 'Steuereinstellungen',
    fields: {
      rules: {
        title: 'Regeln',
      },
      freeShippingCalculation: {
        options: {
          beforeDiscount: 'Vor Rabatt',
          afterDiscount: 'Nach Rabatt',
        },
      },
    },
    preview: {
      rules_zero: 'Keine Regeln ausgewählt',
      rules_one: '{{count}} Regel',
      rules_other: '{{count}} Regeln',
    },
  },
  shopSettings: {
    title: 'Allgemeine Shop-Einstellungen',
    fields: {
      defaultCountry: {
        title: 'Standard Land',
        description: 'Welches Land soll beim Checkout standardmäßig verwendet werden?',
      },
      defaultTaxCategory: {
        title: 'Standard Steuerklasse',
        description: 'Welche Steuerklasse soll für Produkte standardmäßig verwendet werden?',
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
      bankAccount: {
        title: 'Bankdaten',
        description: 'Werden für Rechnungen verwendet',
      },
      orderNumberPrefix: {
        title: 'Bestellnummer-Präfix',
        description: 'Benutzt als Präfix der Bestellnummer, z.B. "ORD-20250315-123456',
      },
      invoiceNumberPrefix: {
        title: 'Rechnungsnummer-Präfix',
        description: 'Benutzt als Präfix der Rechnungsnummer, z.B. "INV-20250315-123456',
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
    },
    groups: {
      displays: 'Anzeigen',
      shipping: 'Versand',
      stock: 'Lagerbestand',
      tax: 'Steuern',
      orders: 'Bestellungen',
      bankAccount: 'Bankdaten',
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
    },
  },
  taxRule: {
    title: 'Regel',
    fields: {
      rate: {
        title: 'Steuersatz in %',
      },
      exciseDuty: {
        title: 'Verbrauchssteuer in %',
      },
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
        description:
          'Der Code wird verwendet, um die Steuerklasse zu identifizieren und kann nur einmalig gesetzt werden.',
        // description: 'The code used by the system. Locked after publishing to prevent breaking the shop.',
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
  orderTotals: {
    title: 'Kosten',
    fieldsets: {
      vat: 'Steuern',
    },
    fields: {
      grandTotal: {
        title: 'Gesamtsumme',
      },
      subtotal: {
        title: 'Zwischensumme',
      },
      shipping: {
        title: 'Versand',
      },
      discount: {
        title: 'Rabatt',
      },
      totalVat: {
        title: 'Steuern Gesamt',
      },
      currency: {
        title: 'Währung',
      },
    },
  },
  order: {
    title: 'Bestellung',
    groups: {
      order: 'Bestellung',
      history: 'Statusverlauf',
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
        options: {
          payment: 'Zahlung',
          fulfillment: 'Versand',
        },
      },
      billingAddress: {
        title: 'Rechnungsadresse',
      },
      trackingNumber: {
        title: 'Sendungsnummer',
      },
    },
  },
  orderCustomer: {
    title: 'Kundendaten',
    fields: {
      locale: {
        title: 'Sprache',
      },
      contactEmail: {
        title: 'Kontakt-Email',
      },
    },
    groups: {
      general: 'Allgemeines',
      billing: 'Rechnungsadresse',
      shipping: 'Versandadresse',
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
      receiveNewsletter: {
        title: 'Newsletter',
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
  variantOptionGroup: {
    title: 'Optionengruppe',
    fields: {
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
    title: 'Blog Eintrag',
    groups: {
      post: 'Allgemeines',
    },
    fields: {
      preview: {
        title: 'Vorschau',
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
        },
      },
      children: {
        title: 'Einträge',
      },
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
      analytics: 'Statistiken',
      company: 'Firma',
    },
    fields: {
      siteTitle: {
        title: 'Seitentitel',
        description: 'Name deiner Seite, normalerweise dein Brand- oder Firmenname',
      },
      siteDescription: {
        title: 'Beschreibung',
        description: 'Beschreibung deiner Seite.',
      },
      siteShortDescription: {
        title: 'Kurzbeschreibung',
        description: 'Kurzbeschreibung deiner Seite.',
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
        description: 'Titel für soziale Netzwerke',
        validation: 'Titel länger als 50 werden von sozialen Netzwerken abgeschnitten',
      },
      shareDescription: {
        title: 'Share-Beschreibung',
        description: 'Beschreibung für soziale Netzwerke',
        validation: 'Beschreibungen länger als 150 werden von sozialen Netzwerken abgeschnitten',
      },
      shareImage: {
        title: 'Share-Bild',
        description: 'Empfohlene Bildgröße: 1200x630px (PNG oder JPG)',
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
  productSection: {
    title: 'Produkte',
    preview: {
      products: 'Produkt(e)',
      categories: 'Kategorie(n)',
    },
    fields: {
      headline: {
        title: 'Überschrift',
      },
      categories: {
        title: 'Kategorien',
        validation: {
          atLeastOneCategoryRequired: 'Es muss mindestens eine Kategorie ausgewählt werden',
        },
      },
      totalProducts: {
        title: 'Anzahl',
        description: 'Anzahl der Produkte, die angezeigt werden sollen',
        validation: {
          numProducts: 'Es können mindestens eines und maximal 50 Produkte angezeigt werden',
        },
      },
    },
  },
  categorySection: {
    title: 'Kategorienliste',
    preview: {
      allCategories: 'Alle Hauptkategorien',
    },
    fields: {
      headline: {
        title: 'Überschrift',
      },
      category: {
        title: 'Kategorie',
        description: 'Wenn keine Kategorie ausgewählt wird, werden alle Hauptkategorien angezeigt.',
      },
    },
  },
  categoryGrid: {
    title: 'Kategorieraster',
    fields: {
      title: { title: 'Titel' },
      categories: { title: 'Kategorien' },
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
