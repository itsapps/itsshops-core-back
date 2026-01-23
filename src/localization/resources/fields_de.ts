const productAndVariantFields = {
  title: {
    title: 'Titel',
  },
  productNumber: {
    title: 'Produktnummer',
  },
  manufacturer: {
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
    description: 'Erhalte eine Benachrichtigung, wenn der Lagerbestand des Produktes unter diesem Limit liegt.',
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
  description: {
    title: 'Beschreibung',
  },
}

export default {
  productGroups: {
    product: 'Produkt',
    description: 'Beschreibung',
    pricing: 'Preise',
    media: 'Medien',
    seo: 'SEO',
    variants: 'Varianten'
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
      ...productAndVariantFields
    }
  },
  productVariant: {
    title: 'Produktvariante',
    fields: {
      ...productAndVariantFields,
      coverImage: {
        title: 'Cover-Bild',
        description: 'Cover-Bild für diese Variant auswählen. Hat keinen Effekt, wenn die Variante eigene Bilder verwendet.'
      },
      options: {
        title: 'Optionen',
      },
      active: {
        title: 'Aktiv',
      },
      featured: {
        title: 'Gefeatured',
        description: 'Wenn ausgewählt, wird diese Variante in der Suche angezeigt. Wenn keine Variante gefeatured ist, wird automatisch die Erste verwendet.',
      },
    },
    preview: {
      variants: "Varianten",
    },
  },
  category: {
    schemaTitle: 'Kategorie',
    title: {
      title: 'Titel',
    },
    description: {
      title: 'Beschreibung',
    },
    parent: {
      title: 'Übergeordnete Kategorie',
    },
    sortOrder: {
      title: 'Reihenfolge',
      description: 'Umso niedriger die Zahl, desto höher die Kategorie in der Navigation',
    },
    image: {
      title: 'Bild',
    },
  },
  manufacturer: {
    schemaTitle: 'Hersteller',
    title: {
      title: 'Titel',
    },
    description: {
      title: 'Beschreibung',
    },
    image: {
      title: 'Bild',
    },
    link: {
      title: 'Link',
    },
  },
  address: {
    schemaTitle: 'Adresse',
    name: {
      title: 'Name',
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
  },
  shipping: {
    fieldsets: {
      rate: 'Versandart',
    },
    rateId: {
      title: 'Versand-ID',
    },
    rateTitle: {
      title: 'Titel',
    },
    rateCost: {
      title: 'Versandkosten',
    },
  },
  orderTotals: {
    schemaTitle: 'Kosten',
    fieldsets: {
      vat: 'Steuern',
    },
    subtotal: {
      title: 'Zwischensumme',
    },
    total: {
      title: 'Gesamtsumme',
    },
    vat: {
      title: 'Inkludierte Steuern in der Zwischensumme',
    },
    vatRate: {
      title: 'Angewendeter Prozentsatz',
      placeholder: '20',
    },
    currency: {
      title: 'Währung',
    },
    discount: {
      title: 'Rabatt',
    },
  },
  order: {
    schemaTitle: 'Bestellung',
    groups: {
      order: 'Bestellung',
      customer: 'Kundendaten',
      totals: 'Kosten',
      vouchers: 'Gutscheine',
    },
    total: {
      title: 'Gesamtsumme',
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
      name: 'Statusverlauf',
      type: {
        title: 'Typ',
        options: {
          payment: 'Zahlung',
          fulfillment: 'Versand',
        }
      },
      state: {
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
    contactEmail: {
      title: 'Kontakt-Email',
    },
    shipping: {
      title: 'Versand',
    },
    billingAddress: {
      title: 'Rechnungsadresse',
    },
    trackingNumber: {
      title: 'Sendungsnummer',
    },
    orderNumber: {
      title: 'Bestellnummer',
    },
    invoiceNumber: {
      title: 'Rechnungsnummer',
    },
    vouchers: {
      title: 'Gutscheine',
    },
    freeProducts: {
      title: 'Geschenke',
    },
    locale: {
      title: 'Sprache',
    },
  },
  tag: {
    schemaTitle: 'Tag',
    title: {
      title: 'Titel',
    },
  },
  user: {
    schemaTitle: 'Kunde',
    customerNumber: {
      title: 'Kundennummer',
    },
    customerGroups: {
      title: 'Kundengruppen',
    },
    prename: {
      title: 'Vorname',
    },
    lastname: {
      title: 'Nachname',
    },
    email: {
      title: 'Email',
    },
    street: {
      title: 'Straße',
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
    phone: {
      title: 'Telefonnummer',
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
      title: 'Registrierungsstatus',
      options: {
        registered: 'Registriert',
        invited: 'Eingeladen',
        active: 'Aktiv',
      }
    },
    locale: {
      title: 'Sprache',
    },
  },
  variantOptionGroup: {
    schemaTitle: 'Optionengruppe',
    title: {
      title: 'Titel',
    },
    description: {
      title: 'Beschreibung',
    },
    options: {
      title: 'Optionen',
    },
    sortOrder: {
      title: 'Sortierung',
      description: 'Je kleiner die Zahl, desto früher wird die Option angezeigt.',
    },
  },
  variantOption: {
    schemaTitle: 'Option',
    title: {
      title: 'Titel',
    },
    image: {
      title: 'Bild',
    },
    sortOrder: {
      title: 'Sortierung',
      description: 'Je kleiner die Zahl, desto früher wird die Option angezeigt.',
    },
  },
  page: {
    schemaTitle: 'Seite',
    groups: {
      page: 'Allgemeines',
      seo: 'SEO',
      content: 'Inhalt',
    },
    title: {
      title: 'Titel',
    },
    slug: {
      title: 'URL-Name',
      validation: 'Erlaubte Zeichen: "a-z" "A-Z" "0-9" "-" "_"',
    },
    modules: {
      title: 'Inhalte',
    },
  },
  post: {
    schemaTitle: 'Blog Eintrag',
    groups: {
      post: 'Allgemeines',
      seo: 'SEO',
      content: 'Inhalt',
    },
    title: {
      title: 'Titel',
    },
    preview: {
      title: 'Vorschau',
    },
    slug: {
      title: 'URL-Name',
      validation: 'Erlaubte Zeichen: "a-z" "A-Z" "0-9" "-" "_"',
    },
    image: {
      title: 'Bild',
    },
    modules: {
      title: 'Inhalte',
    },
  },
  blog: {
    schemaTitle: 'Blog',
    groups: {
      blog: 'Allgemeines',
      seo: 'SEO',
      settings: 'Einstellungen',
    },
    title: {
      title: 'Titel',
    },
    description: {
      title: 'Beschreibung',
    },
    postsPerPage: {
      title: 'Einträge pro Seite',
    },
  },
  hero: {
    schemaTitle: 'Hero',
    headline: {
      title: 'Überschrift',
    },
    image: {
      title: 'Bild',
    },
    backgroundImage: {
      title: 'Hintergrundbild',
    },
    actions: {
      title: 'Interne Verlinkungen',
    },
  },
  link: {
    schemaTitle: 'Link',
    href: {
      title: 'URL',
      description: 'Für Emails "mailto:hallo@beispiel.com", für Telefonnummern "tel:+4365012345678"',
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
    schemaTitle: 'Interne Verlinkung',
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
  action: {
    schemaTitle: 'Aktion',
    title: {
      title: 'Text',
    },
    internalLink: {
      title: 'Verlinkung',
    },
  },
  multiColumns: {
    schemaTitle: 'Spalten',
    preview: {
      columns: 'Spalte(n)',
    },
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
  localeComplexPortable: {
    schemaTitle: 'Inhalt',
    preview: {
      noContent: 'Keine Inhalte',
      image: 'Bild',
    },
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
  complexPortableText: {
    schemaTitle: 'Inhalt',
    decorators: {
      strong: 'Fett',
      emphasis: 'Kursiv',
      left: 'Links ausrichten',
      right: 'Rechts ausrichten',
      center: 'Zentrieren',
    },
    annotations: {
      link: 'Link',
      internalLink: 'Interner Link',
    },
  },
  customImage: {
    schemaTitle: 'Bild',
    title: {
      title: 'Titel',
    },
    altText: {
      title: 'Alternativer Text',
    },
  },
  menu: {
    schemaTitle: 'Menü',
    title: {
      title: 'Titel',
    },
    items: {
      title: 'Einträge',
    },
  },
  navPage: {
    schemaTitle: 'Seite',
    title: {
      title: 'Titel',
    },
    page: {
      title: 'Seite',
    },
  },
  navLink: {
    schemaTitle: 'Link',
    title: {
      title: 'Titel',
    },
    url: {
      title: 'Url',
    },
  },
  settings: {
    general: {
      schemaTitle: 'Allgemeine Einstellungen',
      groups: {
        siteDetails: 'Beschreibungen',
        company: 'Firma',
        bank: 'Bankdaten',
        displays: 'Anzeigen',
        advanced: 'Erweitert',
      },
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
      companyName: {
        title: 'Firmenname',
      },
      companyOwner: {
        title: 'Firmenbesitzer',
      },
      companyPhone: {
        title: 'Telefonnummer',
      },
      companyStreet: {
        title: 'Straße',
      },
      companyZip: {
        title: 'Postleitzahl',
      },
      companyCity: {
        title: 'Ort',
      },
      companyCountry: {
        title: 'Land',
      },
      companyState: {
        title: 'Bundesland',
      },
      companyEmail: {
        title: 'Email',
      },
      companyUID: {
        title: 'UID',
      },
      bankName: {
        title: 'Bankname',
      },
      bankIBAN: {
        title: 'IBAN',
      },
      bankBIC: {
        title: 'BIC',
      },
      orderNumberPrefix: {
        title: 'Bestellnummer-Präfix',
        description: 'Benutzt als Präfix der Bestellnummer, z.B. "ORD-20250315-123456',
      },
      invoiceNumberPrefix: {
        title: 'Rechnungsnummer-Präfix',
        description: 'Benutzt als Präfix der Rechnungsnummer, z.B. "INV-20250315-123456',
      },
      home: {
        title: 'Startseite',
        description: 'Diese Seite wird als Startseite angezeigt',
      },
      privacy: {
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
      gtmID: {
        title: 'Google Tag Manager (GTM)',
        description: 'Um GTM zu aktivieren, gib deine Container-ID ein',
      },
      stockThreshold: {
        title: 'Allgemeines unteres Limit für Benachrichtigungen über Lagerbestände',
        description: 'Erhalte eine Benachrichtigung, wenn ein Produkt unter diesem Limit liegt.',
      },
      lastInvoiceNumber: {
        title: 'Letzte Rechnungsnummer',
        description: 'Achtung! Dieser Wert wird automatisch erhöht und sollte nicht manuell geändert werden.',
      },
    },
  },
  customerGroup: {
    schemaTitle: 'Kundengruppe',
    title: {
      title: 'Titel',
    }
  },
  voucher: {
    schemaTitle: 'Gutschein',
    validation: {
      mustHaveDiscountOrReward: 'Gutscheine müssen einen Rabatt oder eine Belohnung enthalten.',
    },
    title: {
      title: 'Titel',
    },
    description: {
      title: 'Beschreibung',
    },
    active: {
      title: 'Aktiv',
    },
    code: {
      title: 'Gutschein Code',
      description: 'Code, der vom Benutzer eingegeben werden muss, um den Gutschein zu nutzen. Wenn kein Code verwendet wird, wird der Gutschein automatisch angewendet.',
    },
    autoApply: {
      title: 'Automatisch anwenden',
      description: 'Der Gutschein wird automatisch angewendet, falls alle Bedingungen erfüllt sind.',
    },
    discountType: {
      title: 'Ermässigungstyp',
      options: {
        none: 'Keiner',
        fixed: 'Fixer Betrag',
        percentage: 'Prozentueller Betrag',
      }
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
      }
    }
  },
  voucherCondition: {
    schemaTitle: 'Gutschein-Bedingung',
    type: {
      title: 'Bedingungstyp',
      options: {
        product: 'Spezifisches Produkt',
        category: 'Produktkategorie',
        totalValue: 'Mindestwert des Warenkorbs',
        quantity: 'Mindestmenge',
        userStatus: 'Kundenstatus',
      }
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
      }
    },
    messages: {
      productRequired: "Ein Produkt muß ausgewählt werden",
      categoryRequired: "Eine Kategory muß ausgewählt werden",
      minValueRequired: "Der Mindestwert muß gesetzt werden",
      quantityRequired: "Die Mindestanzahl muß gesetzt werden",
      userStatusRequired: "Der Kundenstatus muß ausgewählt werden",
    },
  },
  shippingCountry: {
    schemaTitle: 'Versandland',
    isDefault: {
      title: 'Standard',
    },
    title: {
      title: 'Titel',
    },
    code: {
      title: 'Länderkürzel',
    },
    taxRate: {
      title: 'Steuersatz',
    },
    rates: {
      title: 'Versandarten',
    },
  },
  shippingRate: {
    schemaTitle: 'Versandart',
    title: {
      title: 'Titel',
    },
    amount: {
      title: 'Preis',
    },
    trackingUrl: {
      title: 'Sendungsverfolgung',
      description: 'URL zur Sendungsverfolgung',
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
    schemaTitle: 'YouTube',
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
  productSection: {
    schemaTitle: 'Produkte',
    preview: {
      products: 'Produkt(e)',
      categories: 'Kategorie(n)',
    },
    headline: {
      title: 'Überschrift',
    },
    categories: {
      title: 'Kategorien',
      validation: {
        atLeastOneCategoryRequired: 'Es muss mindestens eine Kategorie ausgewählt werden'
      }
    },
    totalProducts: {
      title: 'Anzahl',
      description: 'Anzahl der Produkte, die angezeigt werden sollen',
      validation: {
        numProducts: 'Es können mindestens eines und maximal 50 Produkte angezeigt werden'
      }
    },
  },
  categorySection: {
    schemaTitle: 'Kategorienliste',
    preview: {
      allCategories: 'Alle Hauptkategorien',
    },
    headline: {
      title: 'Überschrift',
    },
    category: {
      title: 'Kategorie',
      description: 'Wenn keine Kategorie ausgewählt wird, werden alle Hauptkategorien angezeigt.',
    },
  },
  carousel: {
    schemaTitle: 'Karussell',
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
      title: 'Autoplay-Verzögerung',
      description: 'Nächster Slide wird nach den angegebenen Sekunden angezeigt.',
    },
    loop: {
      title: 'Wiederholen',
    },
    slideSize: {
      title: 'Slide-Größe',
    },
    fade: {
      title: 'Fade',
      description: 'Fade-Animationen beim Wechsel der Slides.',
    },
  },

  orderings: {
    asc: "Aufsteigend",
    desc: "Absteigend",
  },

  localeBlock: {
    schemaTitle: 'Lokalisierter Block',
    translations: {
      title: 'Übersetzungen',
    },
  },
  localeImage: {
    schemaTitle: 'Lokalisiertes Bild',
    title: {
      title: 'Titel',
    },
    altText: {
      title: 'Alternativer Text',
    },
    validation: {
      assetRequired: 'Bild ist erforderlich',
    },
  },
  localeString: {
    schemaTitle: 'Lokalisierter Text',
    translations: {
      title: 'Übersetzungen',
    },
    validations: {
      allExist: 'Alle Lokalisierungen müssen vorhanden sein.',
    },
  },
  localeSlug: {
    schemaTitle: 'Lokalisierter URL-Name',
    translations: {
      title: 'Übersetzungen',
    },
  },
  validation: {
    maxLength: 'Wert darf nicht mehr als {{max}} Zeichen enthalten {{field}}',
    oneFieldMustExist: 'Mindestens ein Feld muss existieren {{field}}',
    requiredField: 'Erforderlich ({{field}})',
  }
}