# Changelog

Versions are git tags (no `v` prefix); customers pin them in `package.json`
(`github:itsapps/itsshops-core-back#<tag>`). **Upgrading** lists what a customer must change.
Release flow: core-front `.claude/workflows/consuming-core-and-deploy.md` → "Release flow".

## Unreleased

Release before the core-front minor that writes `mail` history entries (the withdrawal receipt's
entry on the order; without it "Bestellung zuordnen" still works, the order just lacks the entry).

### Upgrading
- **Withdrawals are `liveEdit`:** before upgrading, check each dataset for withdrawal drafts
  (`*[_id in path("drafts.**") && _type == "orderWithdrawal"]{_id, status, orderRef}`, raw
  perspective — core-front's `itsshops sanity` CLI doesn't see drafts). Carry wanted edits over (a
  draft that assigns an order → assign it with "Bestellung zuordnen" after the upgrade), then
  **discard** the drafts.
- Tell shop owners: no "Publish" for withdrawals; orders are assigned via "Bestellung zuordnen"
  (undo: "Zuordnung aufheben"); refunds, also partial, via "Erstatten & abschließen"; "Zugestellt"
  orders can now be set "Retourniert".
- Removed translation keys: `validation.withdrawalUnmatchedWithOrder`,
  `validation.withdrawalOrderHasOpen`, `actions.orderWithdrawal.assign.useOrder`,
  `actions.orderWithdrawal.resolve.intro`. `WithdrawalOrderInput` is gone.

### Added
- **Withdrawal guide box** above the withdrawal form: the next step (assign / refund / wait for the
  goods / close …), "Erstattung bis 〈declared + 14 days〉" with the legal hint, "Überfällig seit …"
  when past, and a collapsible "So geht's". The order view's withdrawals card shows the deadline too.
- **"Bestellung zuordnen"** (unmatched withdrawals): suggestions (exact order number first, each
  saying what matches) + search by order number / email,
  shows the order's customer before confirming, optional confirmation mail to the order's email.
  **"Zuordnung aufheben"** undoes a Studio assignment (`assignedAt`) while still `received`.
- Withdrawals list split into **"Offen"** (nearest deadline first) and **"Erledigt"**.
- Status dialog: a refund on an order with an open withdrawal shows a notice linking to it.
- Success messages (toasts) after the status dialog and every withdrawal dialog.
- **Mail history entries:** `orderStatusHistory.type` gains `mail` (labels "E-Mail" / "Email");
  the order view titles them "E-Mail - <mail type>" (e.g. "E-Mail - Versendet") and shows their
  customer message. `withdrawalReceipt` ("Widerruf erhalten" / "Withdrawal received") labels
  the withdrawal receipt's entry; it's not offered in "Send mail".
- The order view and the dev schema preview translate the history `source`: Studio, Stripe,
  Warenwirtschaft / ERP, Automatisch / Automatic (unknown values stay raw).

### Changed
- **"Erstatten & abschließen"** refunds in full **or in part**, or only closes when something was
  refunded already (no preselection then); optional "Ware ist zurück" sets the order `returned`;
  the mail is `orderRefunded` / `orderRefundedPartially` with the refunded amount.
- Both refund dialogs refuse a refund when the order changed since the dialog opened (another tab
  or editor refunded meanwhile — `actions.refund.changedMeanwhile`).
- **`delivered → returned`** is allowed (also after a partial refund).
- Withdrawal status: the dropdown offers Eingegangen / In Bearbeitung / Abgelehnt only ("Erstattet"
  comes from "Erstatten & abschließen"); "Abgelehnt" asks for an internal reason (appended to the
  note); reopening a rejected one is refused while the order has another open withdrawal.
- "Widerruf erfassen" refuses an empty or future date.
- The status dialog no longer stores the customer message on its status entry (it was written
  before the mail went out, so a failed mail kept a message never sent) — core-front stores it on
  the `mail` entry. Old entries keep theirs.

## 5.3.0

Release before core-front 3.10.0 (which writes `order.refunds`).

### Upgrading
- **Orders are `liveEdit`:** edits (e.g. the tracking code) save straight to the order — no draft,
  no "Publish" button. Before upgrading, check the dataset for open order drafts
  (`*[_id in path("drafts.order-**")]`, raw perspective — core-front's `itsshops sanity` CLI
  doesn't see drafts): carry wanted edits into the published
  order by hand, then **discard** the drafts. Never publish one — it would revert what the payment
  webhook wrote meanwhile (payment status, history, refunds). Tell the shop owner that orders have
  no "Publish" any more.

### Added
- **Refunds on the order:** `order.refunds[]` of the new object `orderRefund` (`refundId`,
  `amount` in cents, `createdAt`, `status`, `failureReason`, `source` `studio` | `stripe`,
  `reason`), hidden outside dev, written by core-front only (from Stripe). The order view shows a
  "Rückerstattungen" card: one line per refund (date · amount · source, status when not
  succeeded, failure reason) and "Erstattet X · Offen Y".
- **Second partial refund** from the status dialog (`partiallyRefunded → partiallyRefunded`).

### Changed
- Status dialog: a partial refund must be below the remaining amount (grand total minus stored
  refunds; hint `actions.order.updateStatus.enterAmountBelowRemaining`, replaces
  `enterValidAmount`). Refund mails state the amount Stripe actually refunded (was the grand total
  for "Refunded").
- "Refund & close": the dialog states the remaining amount; the mail the amount refunded.
- "Send mail": no amount field (core-front states the latest stored refund). The partial-refund
  mail is offered once the order is (partially) refunded, the full-refund mail only for a refunded
  order; Send is disabled with a translated reason where core-front would refuse
  (`sendMailDialog.noStoredRefund`, `sendMailDialog.notFullyRefunded`).

## 5.2.0

Release before core-front 3.9.0 (whose orders carry `orderItemBundleItem`).

### Added
- Order snapshot: `orderItemBundle.items[]` of the new object `orderItemBundleItem` (`variantId,
  productId, title, subtitle, sku, quantity` per bundle, `price` = gross share of one bundle for all
  its units, `vatRate`, `vatAmount`); read-only outside dev. The order view lists a bundle's items
  with their VAT rates and shows the parts' rates ("13 / 20% MwSt") on the line.
- Validation:
  - an **active variant needs a price** — its own or its product's (error; other statuses and
    drafts unaffected). Existing unpriced active variants show the error on their next edit;
  - product: warning when its price is empty and active variants have none of their own;
  - bundle items: error when the same variant is listed twice (raise its quantity instead), and —
    only while the bundle is active — when an item is missing, not active, or has no price;
  - variant status: warning when a variant leaving `active` is in active bundles (names them;
    only with `shop.productKind.bundle`).
- Product Manager: hint under the bundle price "VAT is taken from the items"
  (`productCreatorTool.bundle.vatFromItems`).

- `features.shop.invoices` (default `true`): `false` when another system issues the invoices
  (e.g. wineNET) — the "Send mail" action offers no invoice mail and no "attach invoice PDF".
  Pair with core-front's notify option `invoices: false`.

### Changed
- A bundle has no tax category: the field is hidden on bundle variants and bundle products
  (existing values stay, unused); the Product Manager no longer asks for or writes one.
- Bundle item picker (reference field and Product Manager) offers only active variants with a
  price (own or product's).
- Product Manager "add variants": the price check (product price or every row's) also applies
  when adding variants to an existing product (uses the product's price).

### Fixed
- "Send mail" → partial-refund mail: asks for the refunded amount (same field as the status
  dialog; send disabled until valid). Without it the mail stated the order total.

### Removed
- `shippingMethod.packagingConfigs` (the hidden, read-only per-volume packaging superseded by
  `packagingGroups` in 4.0.0) and its object types `winePackagingConfig` / `winePackage`. Nothing
  read them any more. **Upgrading:** nothing to change; leftover values show as an unknown field in
  the Studio until unset (`patch(id).unset(['packagingConfigs'])`).

## 5.1.1

### Fixed
- Order list: a partially refunded order shows its fulfillment icon (e.g. the truck when shipped)
  instead of a yellow warning — a partial refund needs no further action. A full refund keeps the
  red refund icon. The order view still shows both states.
- Order action, partial refund: the amount field has a visible label "Rückerstattungsbetrag (€)"
  (new key `actions.order.updateStatus.refundAmountLabel`); the "enter a valid amount" hint is
  linked to it (`aria-describedby`, `aria-invalid`). Decimal separator: a dot always works, a
  comma only in a browser set to German (native number field).

## 5.1.0

### Added
- `ctx.constants.allCountryOptions`: every ISO country (`"AT (Österreich)"`, names from
  `Intl.DisplayNames`), for addresses where a person lives. `countryOptions` stays the shop's list.

### Changed
- The customer account address (`address` object, used by `customer`) offers every country, so
  accounts registered from outside Europe (core-front's registration form offers all countries) are
  no longer shown with an invalid country. Order addresses (`addressStrict`), the shop address
  (`businessAddress`), tax countries and shipping keep the shop's list.
- The shop's country list is a fixed list of 52 European codes (`EUROPE_COUNTRY_CODES`, the same
  set as before) with names from `Intl.DisplayNames`; the `countries-list` dependency is gone.
  A few names read differently, e.g. "Tschechien" (was "Tschechische Republik"), "Republik
  Moldau", "Czechia". The `Country` type keeps only `code` + `title` (`emoji`, `continent`,
  `currency` were unused; the tax-country flag comes from `flagEmoji(code)`).

### Fixed
- Shop settings → Versand: "Gratis-Versand Berechnung" (`freeShippingCalculation`) is shown when
  `coupons` **or** `vouchers` is on (was `vouchers` only, so coupon shops never saw it and the
  frontend fell back to "after discount"). New documents start with `beforeDiscount` (was
  `afterDiscount`).
- Order action, partial refund: the euro amount is rounded to whole cents before it goes to Stripe
  (e.g. 4.35 € was sent as 434.99999999999994 and Stripe refused the refund).

### Upgrading
- Nothing to do; existing European codes stay valid.
- Coupon shops: check "Gratis-Versand Berechnung" in the Studio (unset now means "Vor Rabatt",
  see core-front).

## 5.0.0

Pairs with **core-front 3.7.0** (category description rendered as paragraphs).

### Changed
- `category.description` is now `i18nText` (multi-line textarea) instead of `i18nString`, so
  editors can write several paragraphs (blank line = new paragraph) — like product, variant and
  manufacturer descriptions.

### Upgrading
- Existing category descriptions are stored as `internationalizedArrayStringValue` items, which
  the Studio now shows as invalid (the frontend keeps rendering them). Only Tinhof had any; it was
  migrated with a one-off script (each item's `_type` → `internationalizedArrayTextValue`). Any
  other shop: re-enter the description in the Studio, or patch `_type` the same way.

## 4.3.0

Pairs with **core-front 3.5.3** (no withdrawal form without checkout).

### Added
- `features.shop.checkout` (default `true`, like the frontend's flag; feature key `shop.checkout`).
  Set `false` for a shop without online purchases (Rosi Schuster): `shopSettings` hides the
  checkout-only groups (billing, orders, shipping, returns, tax) and the terms / withdrawal policy /
  shipping info pages — so their required fields no longer block publishing — and the
  `orderWithdraw` system link is no longer offered in menus / rich text.

### Upgrading
- Only for a shop without checkout: set `features.shop.checkout: false` in `sanity.config.ts`.
  Values already stored in the hidden fields show as unknown fields — remove them in the Studio.

## 4.2.1

### Changed
- Status dialog: "Kunde benachrichtigen" starts **unchecked** for "Angekommen" (`delivered`) — it is
  mostly bookkeeping for the shop; every other status still starts checked. The checkbox resets to
  the status's default whenever a status is picked.

## 4.2.0

Pairs with **core-front 3.2.0** (`order-notify` accepts `customerMessage`; with an older frontend
the message is stored on the history entry but not shown in the mail).

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

### Upgrading from 1.x
- 2.0.0 moved to **Sanity 6 / React 19** (peer `sanity ^6`): in the customer backend set
  `sanity ^6.9.2`, `react`/`react-dom` `^19.2`, add dev dep `@types/node`, and drop any Sanity-5-era
  `overrides.vite` pin — see `.claude/decisions/sanity-6-platform.md`. Bump these *before*
  `npm install 'github:itsapps/itsshops-core-back#<tag>'`, or npm fails with ERESOLVE on the peer.
- Then the 2.0.0 steps below.

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
