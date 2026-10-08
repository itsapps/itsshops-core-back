# Schemas

Assembled by `buildSchemas(context)` (`src/schemas/index.ts`) from three groups, filtered by the
feature registry (a definition's optional `.feature` tag gates it). This file is the **catalog** of
what schemas exist; for **how to write/extend** them (the `build(ctx)` API, field factory `f`,
builders, auto-translation, validation shortcuts) see
[schema-authoring.md](schema-authoring.md), and for field label/value translation see
[localization.md](localization.md).

## Documents (`src/schemas/documents/`)

`product`, `productVariant`, `category`, `manufacturer`, `page`, `post`, `blog`, `menu`, `settings`,
`shopSettings`, `customer`, `customerGroup`, `newsletterSubscriber`, `coupon`, `voucher`,
`shippingMethod`, `taxCategory`, `taxCountry`, `variantOption`, `variantOptionGroup`, and
`orders/` (order documents).

## Objects (`src/schemas/objects/`)

`address`, `addressStrict`, `businessAddress`, `company`, `bankAccount`, `seo`, `internalLink`,
`menuItem`, `baseImage`, `cropImage`, `localeImage`, `localeAltImage`, `bundleItem`,
`productSpecification`, `shippingRate`, `taxRule`, `generatedZip`, wine objects (`wine`,
`winePackage`, `winePackagingConfig`), and `orders/`.

**Product specifications:** `product` and `productVariant` both have an optional `specifications`
array of `productSpecification` (`label` + `value`, both `i18nString`; Studio label
"Produktdetails" / "Product details"), for any product kind — e.g. "Material: 100% Baumwolle". A
variant's non-empty list replaces the product's (no merge); resolved + rendered by core-front
(`data-layer.md` → "Variant resolution").

**Product description:** `product` and `productVariant` both have an optional `description`
(`i18nText`, plain text; blank lines = paragraphs), any kind. The variant's replaces the product's;
for wines it takes precedence over the VinoFact description.

**Settings validation (feature-conditional):** `settings` / `shopSettings` fields the frontend
depends on are required only when the feature that uses them is on (the rule is chosen at build
time from `ctx.featureRegistry`), so webpage-only customers aren't blocked:
- `shop` / `users` / `newsletter` (= core-front sends mail): `senderName`, `senderEmail`,
  `siteTitle` (default locale) — core-front's mail notifiers throw without them — and `privacyPage`.
- `shop`: `defaultTaxCategory` (otherwise uncategorized products get 0 % VAT), `termsPage` +
  `withdrawalPolicyPage` (checkout hides its confirmations when unset), `billingAddress` street/zip/
  city/country (invoice seller address), `returnShippingBorneBy`. Warnings only: `company`
  name, address (street/zip/city/country), email, vatId, `defaultCountry` (checkout falls back to `'AT'`).

**Mail-related fields (core-front reads them):** `settings.shopNotificationEmail` (optional; inbox
for order copies + withdrawal notifications, empty → `senderEmail`); `company` incl. optional
`registerNumber` / `registerCourt` (rendered in every mail footer only when set);
`shippingMethod.deliveryTime` (optional i18n, snapshotted to `order.fulfillment.deliveryTime`).
Order snapshots written by the payment webhook, read-only: `order.orderDate`, `order.payment`
(`orderPaymentMethod`: type, brand, last4, wallet — order only, not orderMeta).

**Withdrawal-instruction settings (`shopSettings`, group returns):** `withdrawalPeriodStart`
(FAGG Anhang I note [1] variant, default `multipleGoods`), `withdrawalExceptions` (§ 18 list),
`returnPolicyNote` (now also shown next to the instructions), `shippingInfoPage` reference (displays).

**`orderWithdrawal`:** a web declaration that matches no order is stored with status **`unmatched`**
and no `orderRef`, holding the submitted `name` / `email` / `orderNumber` / `locale` (read-only).
`orderRef` is editable only while the **published** status is `unmatched`
(`components/WithdrawalOrderInput.tsx`: order suggestions by submitted number/email/name, the picker
filter hides orders with an open withdrawal, and `status` follows the field — order set → `received`,
cleared → `unmatched`); validation: `unmatched` ⇔ no order, and the chosen order has no other open
withdrawal. Editor rule (in the field descriptions): assign or delete within 30 days. Matched
records are never deleted. Flow + rationale: core-front `commerce-and-netlify.md` → "Withdrawal".

When a frontend feature starts depending on a settings field, add the matching conditional rule
here. Validation only fires when an editor publishes — existing documents must be checked per shop
before go-live.

`menuItem` `linkType`: `internal` | `external` | `submenu` (unless `menus.disableSubmenus`) |
`system`. `system` links a **fixed frontend route** (not a document) chosen in `systemPage`. The
options come from the feature-filtered list in `src/schemas/systemPages.ts`, currently only
`orderWithdraw` (requires `shop`). Rich-text link annotations can offer the same list via
`internalLinkFields({ includeSystemPages: true })` (field `internalLinkSystemPage`). `system` is only offered when at least one is enabled; title is
optional — except for `orderWithdraw`, whose label is fixed by law ("Vertrag widerrufen", FAGG
§13a; the frontend ignores an editor title). The frontend resolves URL + default title and guarantees the withdrawal link: see core-front
`.claude/architecture/data-layer.md` → "Menus & system links".

## Modules (`src/schemas/modules/`)

Page/content building blocks: `carousel`, `categoryList`, `productList`, `productVariantList`,
`youtube`, plus two field-less **legal modules** (feature `shop`): `withdrawalPolicyModule` (generated
withdrawal instructions + model form) and `shippingInfoModule` ("Versand & Zahlung": shipping
methods + warranty notice). Their content comes from settings, rendered by core-front (`commerce-and-netlify.md`
→ "Legal texts"); customers add them to their page `modules` array. These are the array members of a document's `modules[]` and map to frontend module
templates (`itsshops-core-front` → `templates/overridable/modules/` and `core/modules/`). The
`productList` module pairs with the frontend's URL-based filter system.

## i18n fields

Localized fields use `sanity-plugin-internationalized-array`. `createi18nFieldTypes`
(`src/config/fieldTypes.ts`) builds the localized field types from `localizedFieldTypes`; the plugin
registers them with the configured `fieldLanguages`. The frontend resolves these arrays down to plain
per-locale strings (`itsshops-core-front` localizers).

## Templates & actions

- `templateResolver(prev, context)` (`src/config/templates.ts`) — initial-value templates for new
  documents.
- `actionResolver(prev, ctx, context)` (`src/config/actions.ts`) — document actions. Full breakdown
  (per-type actions, singleton rules, the consumer `documentActions` hook) in
  [studio-components.md](studio-components.md).

## Customer extension

Customers add schemas via `ItsshopsConfig.documents[]` / `objects[]` and refine core schemas via
`schemaExtensions`. Prefer tagging new schemas with a `.feature` and letting the registry gate them
over hard-coding conditionals. Mechanics in [schema-authoring.md](schema-authoring.md).
