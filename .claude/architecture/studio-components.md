# Custom studio components, context, tools & actions

Where the plugin injects React into the studio, and the shared context those components rely on.

## Context: the "god hook" (`src/context/`)

`ITSStudioWrapper(ctx)` (`ITSStudioWrapper.tsx`) is registered as the studio `layout` component in
`src/index.ts`. It wraps the studio in `@sanity/ui` `ThemeProvider` + `ITSCoreProvider`.

`ITSCoreProvider` (`ITSCoreProvider.tsx`) exposes everything via **`useITSContext()`** — the hook
every custom component uses. It augments the per-locale `ITSContext` with runtime extras:
- `sanityClient` — `useClient({ apiVersion })`. **In dev it's a Proxy that logs every `fetch`**
  (query, params, timing; slow queries >500ms flagged red). Use this, not a raw client.
- `studioT` — the studio i18next `t`
- `imageBuilder`, `frontendClient` (core-front functions client, `external/frontend.ts`; sends the
  secrets document's `functionsSecret` as `x-server-secret` — without one (not entered / still
  loading) every call returns `{ error: integrations.missingSecrets }` without a request, shown by
  the callers' toasts), `vinofactClient` (only once `vinofactToken` is in the secrets document;
  missing → the `vinofact.notInitialized` toast), `secretsLoading` (the secrets document is still
  loading — right after a page reload `vinofactClient` is missing for a moment; code that loads on
  mount (`WineTab`, `WineSelector`) returns early while it's `true` and runs again once loaded,
  instead of showing `notInitialized`)
- plus all of `ITSContext`: `config`, `featureRegistry`, `locale`, `localizer`, `format`,
  `constants`, `t`/`schemaT`/`structureT`/`componentT`, `i18nFieldTypes`.

Any new studio component should pull what it needs from `useITSContext()` rather than re-creating
clients or translators.

## Tools (`src/config/tools.ts`)

`createTools(ctx)` returns top-nav tools. Currently one: the **Product Manager** (`ProductCreator`),
added only when feature `shop` is enabled. Add a tool here, gated by a feature, with name/title from
the `components` namespace (`componentT`).

## The Product Manager (`src/components/products/productManager/`)

A bulk product+variant creation tool (studio tool, not a field input). `ProductCreator.tsx` renders
a tab per enabled `schemaSettings.productKinds` value — **wine / physical / digital / bundle**
(`tabs/*.tsx`) — plus a shared "main product" section (title i18n inputs, global price/weight; tax under
"Advanced").

- Shapes (rows, combinations, bundle items, props) live in `ProductCreator.types.ts`.
- On submit it builds a Sanity transaction via `src/lib/shop/productVariant.tx.ts`
  (`addProductToTx`, `addWineVariantToTx`, `addPhysicalDigitalVariantToTx`, `addBundleVariantToTx`),
  committed through `src/lib/hooks/useProductTransaction.tsx` (`commitTransaction` resolves
  `true` after a successful commit; errors become a toast). Prices are entered in euros and
  converted to cents on submit.
- **Product link after creation:** the success toast is text only (no button — a toast times
  out, WCAG 2.2.1, is hard to reach by keyboard, and `@sanity/ui`'s toast shrink-wraps its
  content, so a button there can't span it). `ProductCreator` shows a persistent "Zuletzt
  angelegt: <title>" card with an `IntentLink` **below the tabs**, i.e. right under the submit
  button where the editor is (at the top it went unnoticed), cleared on the next submit.
- **Bottle images (`shop.vinofact`):** `WineTab` has a checkbox "Flaschenbilder aus VinoFact
  übernehmen" (default from `features.shop.vinofact.importBottleImages`, `false` unless set; only
  with a `vinofactClient`; also in `AddVariantsAction`'s dialog).
  After a successful commit the submit runs `useBackgroundBottleImport` (not awaited — the form
  resets / the dialog closes as before) on the new, published variants; summary or error toast.
  `addWineVariantToTx` returns the created variant id for it.
- Wine kind pulls options from the VinoFact client; physical/digital expands selected
  variant-option groups into combinations; bundle composes existing variants with quantities
  (picker: active, priced, non-bundle variants only).
- **It writes published variants directly, so no schema validation runs** — each tab's
  `submitCheck` (`{ ok, reasons }`) enforces what the schema would: default-locale title,
  ≥ 1 new variant, "global (product) price or every row's price" (bundle: every row has items),
  also when adding variants to an existing product (`AddVariantsAction` passes the product's
  price as `globalPrice`). `ProductTab` lists the reasons (`productCreatorTool.reasons.*`, with
  the row label) above the submit button and links them via `aria-describedby`; the button stays
  focusable (`aria-disabled`, not `disabled`) and the tabs' `handleSubmit` returns early.
- **Tax category is only written when chosen:** product and row tax selects sit in a collapsed
  `fields/AdvancedSection` (disclosure button with `aria-expanded`/`aria-controls`, content kept
  mounted with `hidden`, count of set values on the toggle). Empty inherits (variant → product →
  `shopSettings.defaultTaxCategory` at checkout); the product select shows the shop default as a
  hint (`shopDefaultTaxCategoryId`, never pre-filled).
- **Submit:** tab `onSubmit` props resolve `true`/`false` (the commit result); tabs reset only
  on `true`, so a failed commit keeps the editor's rows. The wine tab submits only rows that don't
  match an existing variant (`existingWineKeys`).
- **Wine grid (`WineTab`):** the editor picks a **seed wine** (Autocomplete over all VinoFact
  wines). VinoFact has no link between vintages (each is its own wine with a free-text name +
  year), so the grid's rows are every wine with the same `normalizeWineName` (`utils/wineName.ts`:
  `stripYear`, lower-case, accents folded, whitespace collapsed; tested in
  `tests/wineName.test.ts`), newest first; "Weiteren Wein hinzufügen" adds any other wine,
  every row has a labelled ✕ in the last column (its header is sr-only "Entfernen"). Only the newest 5 rows show until "Ältere Jahrgänge zeigen"
  (`aria-expanded`); rows with existing/ticked cells and added rows always show. Columns = the
  volumes used by wine variants in the dataset (`array::unique(…wine.volume)`) + 750 + those
  added via "Flaschengröße hinzufügen", labelled in litres. The grid is a `<table>` (caption,
  `th scope`), each cell a checkbox named "Wein 2023, 0,75 l"; existing cells are checked +
  disabled ("(gibt es schon)" in the name); it scrolls horizontally in its own focusable,
  labelled region (also in the narrower pane). Each ticked cell is a `WineRow` (id = cell key
  `${wineId}:${volume}`, same as `existingWineKeys`) with price and, under "Advanced", tax +
  own title. Clearing the seed (✕) starts over.
- **Title suggestion (wine, creating only):** picking the seed writes `stripYear(seed.title)`
  into the default-locale title (other locales untouched) while that title still equals what
  the suggestion last wrote (`appliedTitle`) — so it follows a re-picked seed until the editor
  edits it, in any tab (the titles are shared). The input shows "Aus VinoFact übernommen" /
  "Vorschlag aus VinoFact: …" (`aria-describedby`); only while the title differs, a
  "Vorschlag übernehmen" button (text + undo icon, not an icon-only ✕-lookalike) restores it and
  moves focus to the title input, since the button then disappears (`MainProduct`
  `titleHint`/`titleAction`/`titleInputId` → `I18nTitleInputs` `hint`/`action`/`defaultInputId`).
- **Duplicate check (creating only, `productManager/duplicates.tsx`):** raw perspective (drafts
  count, `versions.**` excluded, ids merged by `utils/existingProducts.ts` `mergeDrafts`, the
  draft wins). Wine: an exact query over all grid wines' VinoFact ids marks those cells as
  existing and lists "Wein 2023 (0,75 l) ist schon in X"; a hint list (products + wine variants,
  joined client-side by published id) finds products whose title or wines' names match the
  seed's name ("Gibt es schon: X — Jahrgänge dort hinzufügen?"). Other kinds: products of the
  kind with the same `normalizeTitle` (debounced 300 ms). Shown in a caution card with
  `IntentLink`s, announced once (sr-only `role="status"`); never a submit reason.
- **Inherited values (all tabs):** an empty row price shows the product price as placeholder
  (`PriceField inheritedLabel`, "14,90 € vom Produkt"); the empty tax option says what is
  inherited (`TaxCategoryField inheritedLabel`: product's tax, else the shop default) —
  `fields/inherited.ts`.
- **Product level (creating only):** categories (`isDocEnabled('category')`, a `fieldset` of
  checkboxes, published only; with `shop.category.subcategories` nested by `parent` at any depth
  via `utils/productManager.ts` `categoryTree`) and, under "Advanced", manufacturers
  (`isDocEnabled('manufacturer')`) — `fields/ChoiceFieldset`; written onto the product by
  `addProductToTx` (`categoryIds`/`manufacturerIds`), omitted when empty. Never per variant
  (a variant's categories replace the product's in core-front).
- **Per-row extras (`fields/VariantExtrasFields`, under "Advanced"):** status `active` /
  `comingSoon` (default `active`), SKU, and stock only with `shop.stock` and never for bundles.
  Stock is kept as typed: empty = not written = unlimited (core-front skips the check), else a
  whole number ≥ 0 (`parseStock`; anything else is a submit reason). Note: a variant made in
  the Studio starts at the schema's `initialValue: 0`. `baseVariant` takes an options object and
  writes `sku`/`stock` only when set. The price rule applies to `active` rows only (a
  `comingSoon` row may stay without a price, like the schema's `activeNeedsPrice`).
- **Summary (`ProductTab` `summaryLines`):** "Wird angelegt: 1 Produkt, 3 Varianten" (wine: "1
  Wein, 3 Jahrgänge & Flaschen"; adding: "Wird hinzugefügt: 3 Varianten zu X") plus one line
  per variant (label, own or inherited price, "kommt bald"). Only the count line is a live
  region (`role="status"`).
- **Physical/digital rows keep their values** when another option is ticked: `buildCombinations`
  reuses the previous row of a combination (same sorted option ids), only new ones are fresh.
- **Bundle quantity:** `min=1 step=1`; a quantity that isn't a whole number ≥ 1 is a submit
  reason (the schema's `Rule.min(1)` doesn't run on tool writes); `addBundleVariantToTx`'s clamp
  stays as a last guard.
- **Layout (orientation):** the tool has an `h1`; each section is a bordered card with a real
  heading (`fields/SectionHeading`, `h2`) and a one-line description: the product card ("Wein" /
  "Produkt" — "Name und Standardwerte für alle …"), the variants section (`VariantSectionHeader`,
  with count), and in the wine tab a separate "Preise & Details der angekreuzten Flaschen" card
  as soon as the grid exists ("Noch keine Flasche angekreuzt" until a cell is ticked), so the
  editor sees that it continues below the grid. Before a wine is picked, the empty title says it
  will be taken from the wine below, and the wine picker's hint says so too.
- **Wording:** the wine tab says "Wein" (section label, submit "Wein mit 3 Jahrgängen &
  Flaschen anlegen") and "Jahrgänge & Flaschen"; adding uses "… hinzufügen" submit texts.
- **Add variants (`AddVariantsDialog`)**: one component for the document action
  (`variant="dialog"`, closes after submit) and the desk-structure pane `AddVariantsPane`
  (`variant="pane"`, stays open). It loads product, existing variants, tax categories and the shop
  default tax with `{ perspective: 'raw' }`: variants include drafts, and the published and the
  draft version of an edited variant both count as existing (a draft that changed the volume
  must not free the published key); the other parts filter out `drafts.**`/`versions.**`. The pane reloads after each successful submit (without the
  spinner, which would unmount the tab) so the variants just added show as existing.
  Wine: the product's VinoFact ids (`seedWineIds`) seed the grid (ids gone from VinoFact are
  skipped; none → the normal seed picker); a reload merges new seeds in, added rows stay. No
  title suggestion, no duplicate check. A header card shows the product title, price and tax
  (or shop default). The toast says "Varianten hinzugefügt" (`useProductTransaction({ mode:
  'add' })`); the pane also shows a lasting "3 Varianten hinzugefügt" card (cleared on the next
  submit). The document action is disabled until the product is published, with a tooltip
  saying so.
- **a11y:** every field is a real `<label for>` (`LabelField` takes the control's `id`);
  icon-only remove/clear buttons carry `productCreatorTool.a11y.*` labels; option toggles use
  `aria-pressed` + a check icon (not colour alone); combination checkboxes are wrapped in a
  `<label>`. Bundles get **no tax category** (neither product nor variant rows; hint
  `productCreatorTool.bundle.vatFromItems` under the price) — core-front taxes a bundle by its items.
- Field sub-components in `fields/` (`I18nTitleField`, `PriceField`, `TaxCategoryField`,
  `WeightField`, `VariantRow`, …) are reused across tabs.

Related product components: `AddVariantsAction` / `AddVariantsPane` (document action on `product` to
add variants inline), `WineSelector` / `WinePreview`.

### VinoFact bottle image import (`shop.vinofact`)

Copies a wine's VinoFact bottle image into the variant's own `image` — one-off, afterwards an
ordinary Sanity image (nothing loads from i.vinofact.com at page view). Why: ADR
`decisions/vinofact-bottle-images-copied-into-sanity.md`. Logic in `src/lib/shop/vinofactImage.ts` (no
React; tests `tests/vinofactImage.test.ts`):
- `getBottleImages(ids, fieldLocales)` on the VinoFact client (dated API, below) →
  `bottleImageUrl` fills the URL template with the intrinsic size (3000×3000 when unknown) →
  `fetchBottleImage` (a **plain** `fetch` — no headers, so the browser sends a simple CORS
  request; VinoFact's `/r/` answers `Access-Control-Allow-Origin: *`) → `uploadBottleImage`
  (`source: { name: 'vinofact', id, url }`) → `buildLocaleAltImage`.
- **Alt merge:** per content locale an existing non-blank alt is kept (same `_key`), VinoFact's
  alt fills only empty ones; other languages are dropped; crop/hotspot are reset (new image).
  To take VinoFact's alt, the editor clears the field first.
- Three entry points: **field button** `VinofactImageInput` under the variant's image (wine
  variants with a VinoFact id; through the form → draft; "neu übernehmen" asks first in a
  `Dialog`); **product action** `ImportBottleImagesAction` (variants without an image asset;
  reads them with `perspective: 'raw'` and patches the draft when one exists, else published —
  `bottleImageTargets`); **Product Manager** checkbox (above). Uploads run one after another;
  per-variant failures are counted ("3 übernommen, 1 ohne Bild in VinoFact, 0 Fehler"), a failing
  VinoFact request gives the `vinofact.importFailed` toast.

## Document actions (`src/config/actions.ts`)

`actionResolver(prev, context, ctx)` rewrites the per-document action list:
- Singletons → only `publish` / `discardChanges` / `restore`.
- Otherwise filters out `doc.disallowedActions` (per schema definition) or the global
  `['schedule']`; in dev nothing is filtered.
- Appends contextual actions:
  - `order` → `OrderDocumentAction`, `OrderMailDocumentAction`, `OrderWithdrawalCreateAction`
    (`OrderDocumentAction` = "Status aktualisieren": legal transitions from `utils/orderTransitions.ts`;
    choosing `shipped` on a delivery order offers an optional tracking code, saved to
    `fulfillment.trackingCode` in the same patch as the status, before the shipped mail is sent.
    Several numbers may go in one field (comma-separated); the mails link each via
    `shippingMethod.trackingUrl` (`schemas.md`).
    Two separate texts: **internal note** → `statusHistory[].note`, studio only, never mailed;
    **message to customer** (shown only while "notify customer" sends a mail, max 2000 chars =
    core-front `CUSTOMER_MESSAGE_MAX_LENGTH`) → `notifyOrder({ customerMessage })`; core-front
    stores it on the `mail` history entry it appends once the mail is sent (the status entry keeps
    only the note). "Notify customer" is pre-checked per target status
    (`notifyCustomerByDefault` in `orderTransitions.ts`: off for `delivered`, which is shop
    bookkeeping; on otherwise) and resets when another status is picked. `OrderMailDocumentAction` offers the same message field
    (`CustomerMessageField`) and patches nothing itself (core-front appends the `mail` entry). It hides the invoice mail and "attach
    invoice PDF" when `shop.invoices` is off (invoices from another system, e.g. wineNET). Refund
    mails have **no amount field** — core-front states the latest stored refund. They are offered
    by payment status (`refundMailOffered` in `utils/orderRefunds.ts`: partial mail once
    `partiallyRefunded`/`refunded`, full mail only `refunded`), and Send is disabled with a reason
    under the select (`aria-describedby`) where core-front would refuse (`refundMailBlocked`: no
    stored refund for the partial mail; stored refunds below the total for the full mail).
    **Refunds** (payment transitions `succeeded` → `refunded` / `partiallyRefunded`,
    `partiallyRefunded` → `refunded` / `partiallyRefunded` — repeated partial refunds allowed):
    calls core-front `/api/payment/refund` first and patches the order only on success. The
    partial amount must be **below the remaining amount** (`remainingAmount(grandTotal, refunds)` —
    the whole rest is "Refunded", else the Studio would set `partiallyRefunded` while the webhook
    sets `refunded`; hint `enterAmountBelowRemaining`). The refund itself is **`refundOrder`**
    (`lib/shop/orderRefund.ts`, shared with "Refund & close"): it re-fetches the order and refuses
    (`actions.refund.changedMeanwhile`) when its `paymentStatus` or refunded total differs from the
    snapshot taken when the dialog opened (`refundSnapshot` — not the live prop), then refunds
    (`frontendClient.refundPayment(order._id, { amount?, expectedRefunded })` — core-front loads
    the PaymentIntent from the order and compares `expectedRefunded` (the snapshot's refunded
    total) with Stripe's **live** refunds, because the re-fetch only sees refunds already synced
    onto the order (2–3 s later); a mismatch → `REFUND_CONFLICT` → `changedMeanwhile`, no patch, no
    mail — two-tab test on staging, 2026-11-12: equal and different amounts, only the first
    refunded) and commits one
    patch built by `buildRefundPatch` (`utils/orderRefunds.ts`). When the order has an **open
    withdrawal** (`useOpenWithdrawal`) and a refund is selected, a caution notice links to it
    ("handle the refund there"; not a block). `delivered → returned` is always allowed (shops set
    "Zugestellt" once done, so withdrawals arrive on delivered orders). It is typed in euros (native
    `type="number"`: a dot always works, a comma only in a German-locale browser) and sent as
    `Math.round(€ × 100)` cents — Stripe rejects fractional cents. The refund mail gets the amount
    Stripe returned (`result.data.amount`). Flow on the core-front side: core-front
    `commerce-and-netlify.md` → "Refunds")
  - `orderWithdrawal` (`WithdrawalActions.tsx`; each returns `null` where it doesn't apply —
    `withdrawalActionsFor` in `utils/withdrawals.ts`):
    - `WithdrawalAssignAction` "Bestellung zuordnen" (`unmatched` only): up to 5 suggestions from
      the submitted number / email / name, ranked exact order number → email → name (newest first
      within each; else newer orders sharing only the email push the right one out), each card
      saying what matches ("Passt: Bestellnummer, E-Mail") + a search by order number or email (result count in an
      `aria-live` line); "Auswählen" (`aria-pressed`) shows the order's number, name, email, date +
      "send confirmation to the order's email" (default on). Confirm re-checks the order has no
      open withdrawal, then **one** patch `ifRevisionId(rev when the dialog opened)` →
      `orderRef`, `status: received`, `assignedAt` (revision mismatch → "changed meanwhile"), then
      `withdrawNotify`.
    - `WithdrawalUnassignAction` "Zuordnung aufheben" (`received` + `assignedAt` only): back to
      `unmatched`, unsets `orderRef`/`assignedAt`, appends "Zuordnung zu #n aufgehoben, 〈date〉"
      to `note` (revision-guarded). Web-matched and "Widerruf erfassen" records have no
      `assignedAt`, so they can't be unassigned.
    - `WithdrawalResolveAction` "Erstatten & abschließen" (open + `orderRef`): radio group in a
      `fieldset`/`legend` from `resolveOptions` — nothing refunded: Vollständig (default) /
      Teilweise; partially refunded: Vollständig / Teilweise / Nur abschließen, **no default**;
      refunded: close only. Partial = euro field with the status dialog's rules; the hint says the
      rest is not refunded (the withdrawal closes). "Ware ist zurück" when `returned` is a legal
      next state (`returnedOffered`) → order `returned` in the same patch (or alone via
      `buildRefundPatch(…, { refund: 'none', markReturned })`). Order patch first (`refundOrder`,
      snapshot = the order fetched on open), withdrawal → `refunded` second (if that fails, the
      guide's `close` step finishes it without a second refund), then `orderRefunded` /
      `orderRefundedPartially` with the refunded amount.
    - `WithdrawalResendAction` "Bestätigung erneut senden": confirm dialog (stays open with a
      loading button, closes on success) naming the real recipients — core-front
      `order-withdraw-notify` sends to the **assigned order's** customer email **and** the submitted
      one when they differ (editor-assigned withdrawals), else (unmatched) the submitted one. The
      assign dialog's "send confirmation" checkbox and both success toasts name both addresses
      (`mailedToText`, from the response's `recipients`).
    `OrderWithdrawalCreateAction` (on the order) refuses an empty or future "Erklärt am" (`max` =
    now, `aria-invalid` + hint) — it drives the refund deadline.
  - `product` (feature `shop`) → `AddVariantsAction`; (feature `shop.vinofact`) →
    `ImportBottleImagesAction` (null for non-wine products, disabled until published)
  - `category` (feature `shop.category`; schema disallows the plain `delete`, so it's re-added
    here, non-dev only) → with `shop.category.subcategories`: a guarded delete that blocks
    deleting a category which still has subcategories (`createCustomDocumentAction`, a reusable
    query+validate wrapper in `components/actions/CustomDocumentAction.tsx`); without: the plain
    delete. (Sanity's strong `parent` reference blocks it anyway — the guard gives a clear message.)
  - `orderWithdrawal`: delete is disallowed in the schema (a matched withdrawal is a legal record)
    and re-added (non-dev) as a guarded delete that only allows `status == "unmatched"`.
- **An action that hides itself where it doesn't apply must stay while its own dialog is open**
  (the withdrawal actions + "Widerruf erfassen": `if (!opened && !applies) return null`, the
  dialog gets the document as it was on open). Its own save makes it inapplicable; returning
  `null` (or a description without `dialog`) then unmounts the dialog mid-run, so the mail step
  finishes invisibly and its error is lost. Order actions never hide, so they don't need this.
- Every dialog above (status, assign, unassign, refund & close, declare) shows a **success toast**
  when it closes (`@sanity/ui/toast`, announced to screen readers) naming what happened (and the
  mail recipient); errors stay in the dialog's `aria-live` line.
- **Consumer hook, last:** `ctx.config.documentActions?.(actions, context)` — lets a project add or
  wrap actions over the final core set. `withGeneratedZips` (exported from the package root) is the
  shipped example (e.g. used on `page`).

### Product list preview (`src/components/products/ProductPreview.tsx`)

Structure document lists render `SanityDefaultPreview` directly — **`components.preview` is not
used there** (only in form contexts: arrays, references) — and `prepare` must return strings for
title/subtitle (a React element there is rejected at runtime). Only `media` may be a React element,
so `product.preview.prepare` returns `createProductPreviewMedia(ctx)(productId, image, icon)`: one
shared live query per product (`listenQuery` + `shareReplay`, drafts collapsed onto their variant)
→ image (product's, else first variant's, else kind icon), count badge bottom left, draft dot
bottom right, the summary text as `title` tooltip + `sr-only` span. Title = `cmsTitle` || title,
subtitle = title when `cmsTitle` is set.

The overlay (badge, dot, tooltip, sr-only text) and the draft collapsing are shared in
`src/components/PreviewCountMedia.tsx` (`PreviewCountMedia`, `collapseDrafts`). The option group
list uses the same pattern: `createOptionGroupPreviewMedia(ctx)(groupId, icon)`
(`src/components/products/OptionGroupPreview.tsx`) — group icon + option count + draft dot
("3 options · 1 draft", keys `variantOptionGroup.preview.*`).

### Inheritance hints (`src/components/inheritance/`)

An empty variant field uses the product's value (rules: core-front `data-layer.md` → "Variant →
product fallbacks"). Both forms say so live, on top of the static descriptions in `fields_*.ts`:

- **Wiring:** `builders.inherited` / `inheritedBy` only mark the field (`options.inherit` /
  `options.inheritedBy`); `InheritanceField` (plugin `form.components.field`, `src/index.ts`) renders
  `InheritedField` / `OverriddenByVariants` for marked fields and passes every other field through.
  Never as field-level `components.field` — that replaces the type's components (i18n fields lost
  their language input; seen 2026-11-27).
- **Variant form — `InheritedField`** (`builders.inherited`): appends one sentence to the field's
  description: "Vom Produkt: 14,90 €" / "Vom Shop-Standard: …" (tax) / "Produkt hat keinen Wert." /
  "Kein Streichpreis (eigener Preis gesetzt)." (compare-at while the variant has an own price,
  O1) / "Eigener Wert — Produkt: … Feld leeren, um den Produktwert zu verwenden.", plus
  "(Entwurf am Produkt: …)" when the product's draft differs. It shows the **published** product
  (what the shop builds). Data: `useInheritedProduct()` — one `listenQuery` per product id
  (module `Map` + `shareReplay`, as `ProductPreview`), references dereferenced to `{ _ref, title }`;
  the shop default tax is fetched once per session. Renamed tax categories / categories /
  manufacturers show after reopening the form (the listener watches the product only).
- **Product form — `OverriddenByVariants`** (`builders.inheritedBy`): "Eigener Wert in 2 von 5
  Varianten." in the description + a `<ul>` of `IntentLink`s to those variants below the input
  (label: own title — `variantDetails`, else "Variante n"; a draft row gets " (Entwurf)" — drafts
  are collapsed, the draft wins). Nothing when no variant overrides. Compare-at: a variant with an
  own price **or** own compare-at counts. The total counts only variants that have the field
  (`onlyKinds` / `exceptKinds`: weight → physical, tax → not bundles). Data:
  `useOverridingVariants(productId)`, one listener per product.
- **One rule set:** `src/utils/inheritance.ts` (`isSet`, `formatInherited`, `variantHint`,
  `overridesProduct`, `INHERIT_SPECS`; tests `tests/inheritance.test.ts`) — also used by the
  Product Manager's `fields/inherited.ts` (`taxLabel`, a product price of 0 is a price).
- **a11y:** the hint is a string in Sanity's `desc_<id>` node, which the input's
  `aria-describedby` points at only when the schema field has a static description — keep one on
  every wrapped field. State is text, never colour or icon only. No "reset to product value"
  button (O4): editors clear the field. `seo` has only the static text (sub-field merge).
- Strings: `components_*.ts` → `inheritance.*`.

## Other custom components (`src/components/`)

- `PriceInput.tsx` — currency input; the **only** component re-exported publicly
  (`src/components/index.ts`). Used by the `priceField` builder.
- `DiscountValueInput.tsx` — discount `value`: `PriceInput` when the sibling `valueType` is
  `fixed` (entered in euros, stored as cents), the default number input for `percent`.
- `OrderView.tsx` — the order document's overview view (order date, payment method, totals,
  fulfillment, discounts, withdrawals, refunds). Shipping 0 with a `fulfillment.freeShippingReason`
  adds a muted row under "Versand" ("Versandkostenfrei ab Bestellwert" / the shipping discount's
  title, else "durch Rabatt"; legacy "durch Produkt / Gutschein" for unmigrated orders,
  `order.freeShippingReason.*`). The "Rabatte" card lists `appliedDiscounts` (title, code or
  "Automatisch", value, amount — a shipping discount stored with amount 0 (method already free:
  pickup, threshold) shows "Versand war bereits kostenlos" instead of "− 0,00 €"; unmigrated
  orders fall back to `appliedCoupons`), and a discounted
  line shows "nach Rabatt €X" (`order.discounts.*`). A bundle line with `bundle.items` lists its items with their
  VAT rates (instead of its subtitle) and shows the parts' rates ("13 / 20% MwSt"). The
  "Rückerstattungen" card (after the totals, `h4` like its neighbours) lists `order.refunds` — date
  · amount · source, status in words when not succeeded (failed + Stripe's `failureReason`) — and
  "Erstattet X · Offen Y" (`refundedTotal` / `remainingAmount`; failed/canceled don't count). Orders
  are `liveEdit`, so `displayed` = `published`. The status history card translates `source`
  (`order.statusHistory.source.*`: Studio / Stripe / Warenwirtschaft / Automatisch; unknown values
  raw) and titles `mail` entries "E-Mail - <mail type>" (`actions.order.mailTypes.*`, incl. the history-only
  `withdrawalReceipt`) and `erp` entries "Warenwirtschaft - Übernommen"
  (`order.statusHistory.erpStatus.*`). The header shows "In der Warenwirtschaft übernommen am …"
  (`order.erpAccepted`) while `erpAcceptedAt` is set and the order is `created`/`processing`.
- `WithdrawalGuideInput.tsx` — document-level input of `orderWithdrawal`: a `Card` above the form
  with the next step (`withdrawalNextStep`: assign / close / refund / partial / wait / done /
  rejected), the linked order read live (fetch + `listen`). Open **and unmatched** withdrawals also
  show "Erstattung bis 〈declaredAt + 14 d〉" with the legal hint (unmatched: if it's a customer
  who mistyped, the period already runs; the 30-day date is only for deleting non-customers' data) (`withdrawalDeadline`: calendar date in the browser
  timezone; tone `caution` from 3 days before, `critical` + "Überfällig seit …" text when past —
  state in text, not colour only). A native `<details>` "So geht's" below the box (neutral, never tinted; closed; styled summary — chevron instead of the browser marker,
  rotates when open) explains the whole
  flow (`actions.orderWithdrawal.guide.howTo.*`). The order view's withdrawals card shows the same
  "Erstattung bis" / "Überfällig seit" next to an open withdrawal's badge.
- `WithdrawalStatusInput.tsx` — `orderWithdrawal.status` input (see `schemas.md` → `orderWithdrawal`).
  It writes with `sanityClient.patch(…).commit()`, not the form. **Rule for `liveEdit` documents:**
  a custom input that changes a field shown in the desk list preview writes through the client
  (sync commit), like the document actions. The Studio commits form edits with
  `visibility: "async"`; the preview store then re-fetches (1 s debounce) before the query index has
  the change and keeps the old value until the next change or a reload (ADR
  `live-edit-preview-fields-written-by-client.md`).
- `StatusIcon.tsx` (order list preview media: fulfillment status icon; only a **full** refund
  overrides it — a partial refund needs no action, so it shows the fulfillment state), `YoutubePreview.tsx`, and the `CustomToolbar` (studio `toolMenu`) with:
  - `IntegrationsDialog.tsx` (plug icon, **administrators only** — UI only, every member can still
    read the document): edits the secrets document (plugin-and-config.md → "Secrets") with masked
    inputs + a show/hide toggle per field (`aria-pressed`, field name in the label). Own dialog, not
    the package's `SettingsView` (can't mask, swallows write errors); writes the package's format
    itself (`createIfNotExists` + `set({ secrets })`), toasts saved/failed.
  - `DeployDialog.tsx`: Deploy `POST`s `<netlifyBuildHook>?trigger_title=…` (CORS works, a readable
    `200` → "Build requested" toast; disabled ~10 s after); status = Netlify's public badge
    `api/v1/badges/<siteId>/deploy-status` as an `<img>` refreshed every 10 s (cache-busting
    query) — its state isn't readable, so there's no building lock and no cancel ("Netlify" link
    for details). No hook → Deploy disabled + hint. A broken badge image (Chrome:
    `net::ERR_BLOCKED_BY_ORB`) = Netlify answered 404 JSON → `SANITY_STUDIO_NETLIFY_SITE_ID` is not
    an existing site; it must be the **frontend** project of that environment (Project
    configuration → General → Project ID). Upgrade path if editors miss the status: a
    core-front `/api/studio/deploy` proxy with the PAT in server env (core-front plan
    `studio-auth-and-security-hardening.md` → B).

## Where each is wired (`src/index.ts`)

`layout` ← `ITSStudioWrapper` · `toolMenu` ← `CustomToolbar` · `tools` ← reducer (renames `media`) + `createTools` ·
`document.actions` ← `actionResolver` · structure view components ← `createDefaultDocumentNode`.
