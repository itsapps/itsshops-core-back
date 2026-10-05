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
`shippingRate`, `taxRule`, `generatedZip`, wine objects (`wine`, `winePackage`,
`winePackagingConfig`), and `orders/`.

`menuItem` `linkType`: `internal` | `external` | `submenu` (unless `menus.disableSubmenus`) |
`system`. `system` links a **fixed frontend route** (not a document) chosen in `systemPage`. The
options come from the feature-filtered list in `src/schemas/systemPages.ts`, currently only
`orderWithdraw` (requires `shop`). Rich-text link annotations can offer the same list via
`internalLinkFields({ includeSystemPages: true })` (field `internalLinkSystemPage`). `system` is only offered when at least one is enabled; title is
optional. The frontend resolves URL + default title and guarantees the withdrawal link: see core-front
`.claude/architecture/data-layer.md` → "Menus & system links".

## Modules (`src/schemas/modules/`)

Page/content building blocks: `carousel`, `categoryList`, `productList`, `productVariantList`,
`youtube`. These are the array members of a document's `modules[]` and map to frontend module
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
