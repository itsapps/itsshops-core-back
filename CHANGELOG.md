# Changelog

Versions are git tags (no `v` prefix); customers pin them in `package.json`
(`github:itsapps/itsshops-core-back#<tag>`). **Upgrading** lists what a customer must change.
Release flow: core-front `.claude/workflows/consuming-core-and-deploy.md` → "Release flow".

## Unreleased

Pairs with **core-front (unreleased)** (`order-notify` accepts `customerMessage`).

### Added
- "Status aktualisieren" and "Email senden" dialogs: optional **message to customer**, shown in the
  email below the standard text (status dialog: only while a mail is sent; stored on the history
  entry as `customerMessage`).

### Changed
- Status dialog: the free-text field is now labelled **internal note** ("Interne Notiz") with a hint
  that it is never sent to the customer; order view and history entries label note and message.
- "Email senden": the mail-type select has a real label.

## 4.1.1

### Changed
- Order view: the totals show the shipping VAT ("davon 13% MwSt" / "incl. 13% VAT", from
  `fulfillment.taxSnapshot`) under the shipping cost; hidden for free shipping.

## 4.1.0

Pairs with **core-front 3.1.0** (generated privacy policy).

### Upgrading
- Add `{ type: 'privacyPolicyModule' }` to the page `modules` array (`schema/extensions.ts`) to
  offer the generated privacy policy.

### Added
- `privacyPolicyModule` (no feature gate) with `extraSections` (`privacyPolicySection`: heading +
  text) and `dpoContact`.

## 4.0.0

Pairs with **core-front 3.0.0**.

### Upgrading
- Shipping methods: enter **Weinverpackung** as packaging groups (box types: boxes by places +
  bottle sizes with "Flaschen pro Platz"). The old per-volume packaging is hidden (kept read-only
  for this release so a live frontend on the old core still prices); core-front 3.0.0 reads only
  the groups. Release this backend first, enter the groups, then the frontend.

### Added
- `shippingMethod.packagingGroups` (`packagingGroup`, `packagingGroupPackage`,
  `packagingGroupBottle`) — bottle sizes share boxes, e.g. 2 × 0.375 l per 0.75 l place.
- Order packaging lines store the group's sizes (`volumes[]`); `OrderView` shows them
  ("1× 6er · 0.75 l / 0.375 l"), old orders keep their single size.
- Orders, "Status aktualisieren": choosing **shipped** on a delivery order offers an optional
  tracking code (filled in with the current one). It is saved with the status, before the shipped
  mail is sent, so the mail shows it.

## 3.1.0 — 2026-10-13

Pairs with **core-front 2.1.0**.

### Added
- `shippingInfoModule`: `paymentInfo` field ("Zahlungsarten", localized plain text) for the
  payment-methods text — replaces the separate rich-text module on the "Versand & Zahlung" page.

## 3.0.0 — 2026-10-12

First tagged release since 2.0.0. Pairs with **core-front 2.0.0**.

### Upgrading from 2.0.0
- Settings fields the frontend depends on are now **required** per enabled feature — fill them
  in, or the settings can't be published.
- Content for core-front 2.0.0 order email legal: withdrawal-instructions and shipping-info
  modules, a shipping-info page in shop settings, return/withdrawal settings.

### Added
- Order email legal: unmatched withdrawals, payment and delivery-time fields, withdrawal
  instructions and shipping-info modules, `withdrawalExceptions` (one checkbox per line, explained).
- Products and variants: specifications (label/value pairs) and plain-text description.
- Menus: "system page" link type; rich text: optional system-page links (e.g. Widerruf).
- Named file types (`ITSFileDefinition`) for upload-restricted localized files (e.g. PDFs).
- Download groups: generated zips (filenames from group and image titles).
- Variant option groups: display mode; vinofact `qualityGrade` filter.
- Translated option-list titles for string arrays.
- Warning when a page/post URL is not formatted correctly.

### Changed
- Studio orders category lists by `sortOrder`; plain category delete when subcategories are off.
- Typegen outputs to `src/types` (`npm run types`); unused `types/orders.ts` removed.
