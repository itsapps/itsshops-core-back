# Changelog

Versions are git tags (no `v` prefix); customers pin them in `package.json`
(`github:itsapps/itsshops-core-back#<tag>`). **Upgrading** lists what a customer must change.
Releasing: core-front `.claude/workflows/consuming-core-and-deploy.md` → "Releasing a customer to production".

## Unreleased

- **Variant fields say what they inherit:** every field a variant takes from its product when
  empty (title, description, details, price, compare-at price, tax category, categories,
  manufacturers, weight, image, SEO) now has a hint ("Leer = vom Produkt.", categories and
  manufacturers *replace* the product's), and the product's fields say they apply to every
  variant without an own value. **Upgrading:** a shop that overrides one of these
  `productVariant.fields.*` / `product.fields.*` descriptions keeps its own text.
- **Compare-at price warning:** a compare-at price that isn't higher than the price (variant: own
  price, else the product's) warns — the shop doesn't show it (core-front: a variant with its own
  price no longer inherits the product's compare-at price).
- **Inherited values live in the form:** a variant's inheritable fields say what the variant uses
  now — "Vom Produkt: 14,90 €", "Eigener Wert — Produkt: …", "Kein Streichpreis (eigener Preis
  gesetzt)", plus "(Entwurf am Produkt: …)" when the product's draft differs; the product's fields
  say "Eigener Wert in 2 von 5 Varianten." and link those variants. New builders
  `inherited` / `inheritedBy` (`schema-authoring.md`). **Upgrading:** nothing; a shop that
  replaces one of these fields in a schema extension loses the hint unless it wraps its field too.

- **Deleting a product or an option group no longer leaves a "Missing document" in its list:**
  the list (product + variants / group + options) turns into "… wurde gelöscht." — before,
  clicking the leftover item opened a new document with the deleted id.
- **A new option group, once saved, opens as list again:** opened again from the group list it
  shows the group with its options and "Neue Option" like any other group (before: still its
  form, because Sanity reused the first resolution).
- **No false "Vinofact-Client nicht initialisiert" after a reload:** the Product Manager's wine
  tab and the variant's wine picker wait for the integration secrets to load instead of
  reporting VinoFact as not set up (context: `secretsLoading`).
- **Product Manager — clearer and safer:** submit reasons are listed above the button instead
  of a silently disabled button; the tax category moved under "Advanced" and is no longer
  pre-filled with the shop default (empty = inherited, so a product follows a later change of
  the shop default); a failed commit keeps the entered rows; adding variants never creates one
  that already exists (also not from the desk-structure pane on a second run, and not
  when a variant has unpublished edits); picking a wine no longer clears the product title in
  other languages; all fields are properly labelled for screen readers.
- **Product Manager — wine tab as a vintage × bottle-size table:** pick one VinoFact wine and
  the table lists every vintage with the same name (newest 5, "show older"); tick the cells to
  create, one variant each (price, and under "Advanced" tax + own title). Other wines (e.g. a
  renamed vintage) and bottle sizes can be added; the default columns are the volumes already in
  use + 0.75 l. The product title follows the picked wine until edited ("Vorschlag übernehmen" restores it). Before
  creating, the tool warns when a product or the same wine + size already exists (also drafts),
  with a link; existing cells can't be ticked. Empty price/tax fields show what they inherit
  ("14,90 € vom Produkt", "vom Produkt: …" / "Shop-Standard: …") in every tab; the other tabs
  warn about a product with the same name. Adding variants to a wine product starts with the
  product's wines in the table, shows the product's price/tax, a "Varianten hinzugefügt" toast
  and, in the desk pane, a lasting confirmation; the disabled action explains "publish first".
- **Product Manager — more per variant, summary:** categories (nested with subcategories) and,
  under "Advanced", manufacturers on the product; per variant under "Advanced" status (active /
  coming soon — coming-soon variants need no price), SKU and stock (with `shop.stock`; empty =
  unlimited). A summary above the button lists what will be created with prices. Ticking another
  option no longer wipes values typed into physical/digital variants; bundle quantities must be
  whole numbers ≥ 1. Clearer layout: each step is its own card with a heading and a one-line
  description (product data for all variants; vintages & bottles; prices & details of the ticked
  bottles); the empty title and the wine picker say that the title is taken from the wine; the
  title's "use suggestion" button is a text button shown only while the title differs. The
  "Zuletzt angelegt … Produkt öffnen" card moved from the top to right under the submit button;
  the success toast no longer has an "Produkt öffnen" button.
- **`features.shop.vinofact.importBottleImages`** (default `false`): the Product Manager's "copy
  bottle images from VinoFact" checkbox now starts **unchecked**. **Upgrading:** shops that want
  bottle images on by default set `features.shop.vinofact.importBottleImages: true`.
- **Releases and Tasks really gone from the Studio:** the `releases`/`tasks`/`scheduledDrafts`
  switches moved from the plugin to each workspace — Sanity silently ignored them in the plugin,
  so the "Releases" tool and Tasks still showed.
- **Product list in the Studio:** a product opens one list with the product on top and its
  variants below (live, ordered by vintage/volume, option order, then creation; each with its own
  draft dot) plus "New variant" — one click less to a variant. The product row's image shows the
  variant count (bottom left) and a dot when a variant has a draft (bottom right); the full
  summary ("3 variants · 1 draft · 1 sold out") is its tooltip and screen-reader text. Without a
  product image it shows the first variant's image.
- **Option groups in the Studio:** a group opens one list with the group, its options (by
  order) and "New option" (created in this group) — no separate "Options" step. Option groups
  sort by order or title. The group row's icon shows the option count and a dot when an option
  has a draft, like the product row ("3 options · 1 draft" as tooltip and screen-reader text).
- **German "Neu: {type}"** instead of Sanity's "Neues {type}" for new documents ("Neues Option").
- **`product.cmsTitle`** ("Internal name", optional, Studio only): title of the product's list
  preview and searchable, the shop title moves to the subtitle — tells same-named products apart.
  Not read by core-front. **Upgrading:** optional; fill it where products share a name.
- **Sort menus:** core documents no longer get Sanity's generated one-entry-per-field sorts
  (untranslated, e.g. "Display mode", "Kind", "Weight") — only their own plus last
  edited/created. Products: "Title (A–Z)", "Internal name (A–Z)"; categories: "Order"
  (`sortOrder`), "Title (A–Z)"; option groups and options: "Order".
- **`rxjs` dependency** (`^7.8.2`, the version `sanity` already installs — deduped).

- **Studio tasks disabled** (`tasks: { enabled: false }`, like comments): the Tasks button is
  gone, so the Studio no longer creates a `<dataset>-comments` add-on dataset. **Upgrading:** an
  existing, empty `<dataset>-comments` dataset can be deleted (`sanity dataset delete`); check
  it for documents first.
- **`shippingMethod.trackingUrl`** (optional, hidden for pickup): the carrier's tracking page with
  `{code}` for the tracking number, e.g. `https://tracking.dpd.de/status/de_DE/parcel/{code}`
  (validated: `https://` + `{code}`). core-front links each tracking number in the order mails with
  it — read at send time, so it also applies to existing orders. **Upgrading:** optional; enter it
  per delivery method.

## 7.0.1

**Fresh public repository.** The git history before 7.0.1 is archived; older tags can no longer be
installed from GitHub — pin `7.0.1` or later. Upgrading from an older version: follow the
"Upgrading" sections below as usual. Pairs with core-front 6.1.0.

- **Docs ship with the package:** `CLAUDE.md` and `.claude/{architecture,decisions,workflows}` are
  in `files`, so a customer's `CLAUDE.md` can import `@node_modules/@itsapps/itsshops-core-back/CLAUDE.md`
  instead of a machine-specific path. Optional: switch the import once this version is pinned.

## 7.0.0

Discounts model: one `discount` document for codes and automatic discounts, product selector,
shop-wide exclusions, line-level order snapshot.
Needs core-front 6.0.0 (it reads `discount`, not `coupon`).

- **`discount` document** replaces `coupon` (desk list "Rabatte"): `trigger` `code` (needs
  `shop.coupons`) | `automatic` (new flag `shop.automaticDiscounts`; the field hides when only one
  is offered), `target` `items` | `order` | `shipping`, `valueType` `percent` | `fixed` | `free`
  (`free` = shipping only), `appliesTo` (product selector; for shipping: "the cart contains"),
  `ignoreShopExclusions`, `appliesToPickup` (shipping; unset = code yes, automatic no),
  `minSubtotal` + `minSubtotalBasis` (`wholeCart` | `matching`), `minQuantity`, `validFrom/To`,
  `maxRedemptions`, `maxPerEmail` (codes only), `combinesWith` { items, order, shipping },
  read-only `redemptionCount`. Codes are unique case-insensitively (checkout matches them that
  way). Warnings (don't block publishing): a criterion's feature (category, manufacturer) is off;
  100 % (checkout can't take payments below €0.50); an automatic discount without product
  selection, minimum subtotal or minimum quantity (applies to every order once published).
- **`productSelector`** (+ `productSelectorCriteria`): `include` / `exclude` with product kinds,
  categories (`shop.category`), manufacturers (`shop.manufacturer`), products, variants and "has
  compare-at price". All references weak.
- **`shopSettings.discountExclusions`** ("Nie rabattieren", new group "Rabatte", with checkout +
  coupons or automatic discounts). `freeShippingCalculation` also shows with automatic discounts.
- **Order snapshot:** `appliedDiscounts[]` (`appliedDiscount`: weak `discountRef`, `code`, `title`,
  `trigger`, `target`, `valueType`, `value`, `amount`; group "Rabatte"), `orderItem.discount` and
  `orderItemBundleItem.discount` (gross cents for the whole line, read-only),
  `fulfillment.freeShippingReason` `threshold` | `discount`. The old `appliedCoupons` (now
  read-only, hidden when empty; `couponRef` points at `discount`) and the reason values `product`
  / `coupon` stay readable until the migration ran everywhere (removed in a later minor).
- **Order view:** discounts card from `appliedDiscounts` (title, code/automatic, value, amount),
  "nach Rabatt €X" under a discounted line, the free-shipping reason row shows the shipping
  discount's title.
- **Removed:** `shop.productFreeShipping` and `productVariant.grantsFreeShipping` — product free
  shipping is now an automatic shipping discount (the migration creates it).
- Order history type `system` (status `discountsMigrated`, "System - Format migriert"): written
  by the migration on each migrated order.
- Reference lists show the translated type name ("Hersteller", "Kundengruppe", "Option") instead
  of the Studio's untranslated "Reference to …" — product/variant manufacturers, customer groups,
  variant options, the discount's product selector and the `builders.variantReference()` helper
  (a customer's own `title` on it can go).
- Discounts: a fixed value is entered in euros (`DiscountValueInput`, stored as cents as before);
  editor descriptions on the discount fields. A shipping discount with amount 0 shows "Versand war
  bereits kostenlos" in the order view.
- **Pickup:** `shippingMethod.pickupAnnounceReady` ("Abholbereit-Mail ankündigen", default off),
  copied into the order's `fulfillment` (read-only). Pairs with core-front 6.0.0, which announces
  the "ready for pickup" mail only when it is on.
- Integrations toolbar button: bleed mode, less prominent next to Deploy.
- Derived feature key `shop.discounts` (= coupons || automatic discounts) gates the `discount`
  document and its objects; not a config field.

### Upgrading
- Remove `productFreeShipping` from `features.shop` in `sanity.config.ts` (it no longer
  type-checks); add `automaticDiscounts: true` where automatic discounts are wanted (e.g. when a
  migrated bundle free-shipping rule must stay editable).
- Run the data migration on the dataset **before** the new frontend goes live (core-front
  `itsshops sanity migrate-discounts`, dry run first, backup before): coupons → `discount-<id>`,
  `grantsFreeShipping` → one automatic shipping discount, orders → `appliedDiscounts` + line
  discounts. Until it ran, old `coupon` documents are invisible in the Studio.
- Pair with core-front 6.0.0.

## 6.3.0

Store pickup (shipping method type "Abholung", pickup order statuses), ERP-accepted orders
(`erpAcceptedAt`), module theme labels.

- **Store pickup**: shipping method type
  "Abholung" with `pickupFee`, `pickupAddress` (country = an enabled tax country),
  `pickupInstructions`, `pickupHoldDays`; delivery-only fields hide for pickup. Order snapshot
  `fulfillment.pickupAddress` / `pickupInstructions` / `pickupHoldDays` (replaces the unused
  `pickupLocation`). Pickup orders: status labels "Abholbereit" / "Abgeholt" (dialog, badge,
  history, "Send mail"), an "Abgeholt" order can be returned, an "Abholbereit" one cancelled; a
  full refund cancels it; withdrawal guide "Noch nicht abgeholt". Order view: pickup card with
  the deadline ("Abholen bis …", highlighted once past). Order list preview falls back to the
  billing address (pickup orders have no shipping address).
- `addressStrict.country` (order addresses) lists every ISO country.
- `requiredSubfields(…, { when })`: the rule applies only where `when(context)` is true.

- **Fixed:** the module `theme` field (`builders.module({ allowTheme: true })`) had no label —
  the Studio showed `theme` / `light` / `dark` / `accent`. Now global labels in `fields_de/en`
  ("Hintergrund": Hell / Dunkel / Akzent); a customer can still override them per module
  (`<module>.fields.theme`).
- **ERP accepted an order** (core-front wc-api `completedMeans: 'accepted'`):
  new read-only order field
  `erpAcceptedAt` (hidden outside dev, written by core-front only) and history type `erp`
  (status `accepted`, "Warenwirtschaft - Übernommen"). The order view shows "In der
  Warenwirtschaft übernommen am …" while such an order is still "Neu" / "In Bearbeitung".

### Upgrading
- Nothing to change — the field stays empty unless the frontend's wc-api runs in `accepted` mode.
- Store pickup needs core-front with pickup support; "Abholung" appears in every checkout shop's
  shipping method type list, nothing changes until a pickup method is created.

## 6.2.0

- **VinoFact bottle images → Sanity** (ADR `decisions/vinofact-bottle-images-copied-into-sanity.md`):
  copy a wine's VinoFact bottle shot into the variant's own `image` — a button under the variant's
  image ("Flaschenbild aus VinoFact übernehmen"), a product action for all variants without an
  image, and a Product Manager checkbox for new variants. Existing alt texts are kept, VinoFact's
  alt (per language) fills empty ones. Only with `shop.vinofact`.
- **Product Manager:** after creating a product, the toast has an "Produkt öffnen" button and the
  tool shows a persistent "Zuletzt angelegt: …" link.
- **VinoFact dated API `v2026-11-14`:** the Studio calls `<origin>/api/graphql/v2026-11-14/`
  (`VINOFACT_API_VERSION` in `src/external/vinofact.ts`). `SANITY_STUDIO_VINOFACT_API_URL` is
  optional — only its origin is used, default `https://www.vinofact.com`.
- **Fixed:** variant previews (lists, reference pickers) and bundle-item previews show the
  variant's image, else the product's — they always showed the kind icon (the image was read as
  an i18n array; the bundle item selected a non-existent `image.image`).
- The unused config field `integrations.vinofact` is removed — endpoint and profile slug come from
  env only (no customer set it).

### Upgrading
- Nothing to change: it uses the `vinofactToken` already required since 6.0.0. Existing
  `SANITY_STUDIO_VINOFACT_API_URL` values keep working (their path is ignored); remove them once
  this version is live (core-front plan → Rollout step 5).

## 6.1.0

- **`shop.productFreeShipping`** (default off, needs checkout): variant field `grantsFreeShipping`
  ("Versandkostenfrei", pricing group, hidden on digital) — the whole order ships free. Pairs with
  core-front 5.1.0's product free shipping.
- **Order snapshot `fulfillment.freeShippingReason`** (`product` / `threshold` / `coupon`), shown
  in the order view under the shipping total.

### Upgrading
- **Coupons now need checkout:** `shop.coupons` is off with `features.shop.checkout: false` (no
  active shop affected).
- Enable with `features.shop.productFreeShipping: true` in the backend config.

## 6.0.0

Menu items per level, and the security hardening: no credentials in the Studio bundle (secrets
document + Integrations dialog), Deploy via build hook, refunds by order id, Presentation preview
mode. Release together with core-front 5.0.0 (refund contract + preview) — per customer, frontend
and backend in the same session.

### Upgrading (security hardening)
- **Credentials move out of env/config.** Remove `SANITY_STUDIO_NETLIFY_ACCESS_TOKEN`,
  `SANITY_STUDIO_NETLIFY_FUNCTIONS_SECRET` and `SANITY_STUDIO_VINOFACT_API_TOKEN` from `.env*`
  **and** from both Studio Netlify projects. `integrations.vinofact.accessToken` in
  `sanity.config.ts` no longer exists (TypeScript flags it) — delete it. Then, as administrator,
  toolbar → **Integrations** (plug icon), once per dataset: the frontend's
  `SERVER_FUNCTIONS_SECRET` (a **new** one — rotate it in the frontend's Netlify env too), its
  Netlify **build hook** URL (Netlify → frontend project → Build hooks, one per branch) and the
  Vinofact token. Until then refunds/mails show "Integration settings are missing" and Deploy is
  disabled.
- `SANITY_STUDIO_NETLIFY_SITE_ID` must be the **frontend** project of that environment (now also
  the deploy-status badge).
- **Deploy dialog**: build hook + Netlify's status badge; no "building" state and no cancel any
  more (cancel in Netlify).
- **Refunds**: `ITSFrontendClient.refundPayment(orderId, { amount?, expectedRefunded? })` (was
  `paymentIntentId`) — needs core-front ≥ 5.0.0 (it 400s an old body, and an old core-front 400s
  the new one). `refundOrder` sends the dialog's refunded total as `expectedRefunded`; core-front
  refuses with `REFUND_CONFLICT` when another tab/editor refunded meanwhile → "changed meanwhile"
  (before, a second tab within 2–3 s refunded again). `FrontendResponse` errors carry `code`.
- **`./external`**: `createNetlifyClient` and the `NetlifyClient` / `NetlifyBuild` types are
  removed. `NetlifyConfig` lost `accessToken` + `secret`, `VinofactIntegrationConfig` lost
  `accessToken`.
- **Presentation** opens `/api/preview-enable` first: the frontend needs core-front 5.0.0's
  `preview_enable.mts` wrapper and the widened `preview.mts` path (core-front CHANGELOG).
- Tests that read `SANITY_STUDIO_VINOFACT_API_TOKEN` (customer `tests/utils/vinofact.ts`): rename to
  `VINOFACT_API_TOKEN` in the code and `.env` (no prefix → not bundled).
- After `npm install`: `npm ls @sanity/ui` must show one version (`@sanity/studio-secrets` needs
  `^4.4.10`).
- After the Studio redeploy: rotate the Vinofact token — old deploys stay reachable at their
  Netlify permalinks.

### Fixed
- Bundles: the Product Manager's variant dropdown is sorted and always shows vintage/volume
  (wine) or the options (physical/digital), also for variants with their own title; bundle items
  in the variant form show them as subtitle (`src/utils/variantLabel.ts`, shared with the variant
  preview). A variant with its own title now has the product name in front of its preview
  subtitle ("Grüner Veltliner · 0,75 l • 2023"), so reference pickers, search and the flat variant
  list tell same-named variants of different products apart. Nothing to change.
- Withdrawal "Resend confirmation" opens a confirm dialog (recipient shown) that stays open with a
  loading button until the mail went out, then closes with the toast; errors stay in the dialog.
  Before, the menu closed at once and nothing showed progress. It names the addresses core-front really
  sends to: the assigned order's customer email and, when it differs, the address the withdrawal
  was submitted with (core-front 5.0.0 sends to both), else the submitted email. The assign
  dialog and the success toasts name both too.

### Upgrading (menu levels)
`menus.maxDepth` = number of menu levels, top level included (1 = flat, default; 2 = top-level
links + submenus of links).

- **`menus.disableSubmenus` is removed** — `maxDepth` alone decides (`1` = flat, the default;
  `2` = submenus). Delete the line from `schemaSettings.menus` (TypeScript flags it otherwise);
  with `disableSubmenus: false` keep/set `maxDepth: 2`.
- **Projects with submenus**: items inside a submenu are now type `menuItem1` (`menuItem2`, …
  for deeper levels). Existing ones are stored as `menuItem` and must be relabelled by nesting
  level, drafts included — otherwise the Studio flags them as an unknown type. The frontend is
  not affected (it reads fields, not `_type`). A one-off script in the customer backend
  does it (none shipped by core).
- `maxDepth` now means what it says: with `maxDepth: 2` the Studio offers exactly
  top-level links + submenus of links; a submenu inside a submenu is no longer possible.
  Projects without submenus: nothing to do.

### Changed
- One item type per menu level (`menuItem`, `menuItem1`, …): the last level offers no
  `submenu` choice and no `children` field. Replaces the depth validation, which also fired on a
  link's own empty `children` (so at `maxDepth: 1` no submenu validated).
- Schema definitions may set `baseName`: labels, `schemaExtensions` and groups follow it, so
  generated types share one definition (`schemaExtensions.menuItem` applies to every level).

## 5.4.0

Release before core-front 3.11.0, which writes `mail` history entries (incl. the withdrawal
receipt's entry on the order; without it "Bestellung zuordnen" still works, the order just lacks
the entry).

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
  the Studio now shows as invalid (the frontend keeps rendering them). Where a shop had any, they were
  migrated with a one-off script (each item's `_type` → `internationalizedArrayTextValue`). Any
  other shop: re-enter the description in the Studio, or patch `_type` the same way.

## 4.3.0

Pairs with **core-front 3.5.3** (no withdrawal form without checkout).

### Added
- `features.shop.checkout` (default `true`, like the frontend's flag; feature key `shop.checkout`).
  Set `false` for a shop without online purchases: `shopSettings` hides the
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
