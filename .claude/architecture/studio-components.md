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
- `imageBuilder`, `frontendClient` (Netlify functions client), `vinofactClient` (when configured)
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
(`tabs/*.tsx`) — plus a shared "main product" section (title i18n inputs, global price/tax/weight).

- Shapes (rows, combinations, bundle items, props) live in `ProductCreator.types.ts`.
- On submit it builds a Sanity transaction via `src/lib/shop/productVariant.tx.ts`
  (`addProductToTx`, `addWineVariantToTx`, `addPhysicalDigitalVariantToTx`, `addBundleVariantToTx`),
  committed through `src/lib/hooks/useProductTransaction.ts`. Prices are entered in euros and
  converted to cents on submit.
- Wine kind pulls options from the VinoFact client; physical/digital expands selected
  variant-option groups into combinations; bundle composes existing variants with quantities
  (picker: active, priced, non-bundle variants only).
- **It writes published variants directly, so no schema validation runs** — the tabs' `canSubmit`
  enforce what the schema would: "global (product) price or every row's price", also when adding
  variants to an existing product (`AddVariantsAction` passes the product's price as
  `globalPrice`). Bundles get **no tax category** (neither product nor variant rows; hint
  `productCreatorTool.bundle.vatFromItems` under the price) — core-front taxes a bundle by its items.
- Field sub-components in `fields/` (`I18nTitleField`, `PriceField`, `TaxCategoryField`,
  `WeightField`, `VariantRow`, …) are reused across tabs.

Related product components: `AddVariantsAction` / `AddVariantsPane` (document action on `product` to
add variants inline), `WineSelector` / `WinePreview`.

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
    Two separate texts: **internal note** → `statusHistory[].note`, studio only, never mailed;
    **message to customer** (shown only while "notify customer" sends a mail, max 2000 chars =
    core-front `CUSTOMER_MESSAGE_MAX_LENGTH`) → `notifyOrder({ customerMessage })` and
    `statusHistory[].customerMessage`. "Notify customer" is pre-checked per target status
    (`notifyCustomerByDefault` in `orderTransitions.ts`: off for `delivered`, which is shop
    bookkeeping; on otherwise) and resets when another status is picked. `OrderMailDocumentAction` offers the same message field
    (`CustomerMessageField`) but writes no history entry. It hides the invoice mail and "attach
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
    sets `refunded`; hint `enterAmountBelowRemaining`). It is typed in euros (native
    `type="number"`: a dot always works, a comma only in a German-locale browser) and sent as
    `Math.round(€ × 100)` cents — Stripe rejects fractional cents. The refund mail gets the amount
    Stripe returned (`result.data.amount`). "Refund & close" (`WithdrawalActions.tsx`) states the
    remaining amount and mails the refunded one. Flow on the core-front side: core-front
    `commerce-and-netlify.md` → "Refunds")
  - `orderWithdrawal` → `WithdrawalResolveAction`, `WithdrawalResendAction`
  - `product` (feature `shop`) → `AddVariantsAction`
  - `category` (feature `shop.category`; schema disallows the plain `delete`, so it's re-added
    here, non-dev only) → with `shop.category.subcategories`: a guarded delete that blocks
    deleting a category which still has subcategories (`createCustomDocumentAction`, a reusable
    query+validate wrapper in `components/actions/CustomDocumentAction.tsx`); without: the plain
    delete. (Sanity's strong `parent` reference blocks it anyway — the guard gives a clear message.)
  - `orderWithdrawal`: delete is disallowed in the schema (a matched withdrawal is a legal record)
    and re-added (non-dev) as a guarded delete that only allows `status == "unmatched"`.
- **Consumer hook, last:** `ctx.config.documentActions?.(actions, context)` — lets a project add or
  wrap actions over the final core set. `withGeneratedZips` (exported from the package root) is the
  shipped example; Jurtschitsch uses it on `page`.

## Other custom components (`src/components/`)

- `PriceInput.tsx` — currency input; the **only** component re-exported publicly
  (`src/components/index.ts`). Used by the `priceField` builder.
- `OrderView.tsx` — the order document's overview view (order date, payment method, totals,
  fulfillment, withdrawals, refunds). A bundle line with `bundle.items` lists its items with their
  VAT rates (instead of its subtitle) and shows the parts' rates ("13 / 20% MwSt"). The
  "Rückerstattungen" card (after the totals, `h4` like its neighbours) lists `order.refunds` — date
  · amount · source, status in words when not succeeded (failed + Stripe's `failureReason`) — and
  "Erstattet X · Offen Y" (`refundedTotal` / `remainingAmount`; failed/canceled don't count). Orders
  are `liveEdit`, so `displayed` = `published`.
- `WithdrawalOrderInput.tsx` — `orderWithdrawal.orderRef` input for assigning unmatched
  declarations (see `schemas.md` → `orderWithdrawal`).
- `StatusIcon.tsx` (order list preview media: fulfillment status icon; only a **full** refund
  overrides it — a partial refund needs no action, so it shows the fulfillment state), `YoutubePreview.tsx`, `DeployDialog.tsx` (triggers a Netlify build via the
  Netlify integration env/config), and the `CustomToolbar` (studio `toolMenu`).

## Where each is wired (`src/index.ts`)

`layout` ← `ITSStudioWrapper` · `toolMenu` ← `CustomToolbar` · `tools` ← `createTools` ·
`document.actions` ← `actionResolver` · structure view components ← `createDefaultDocumentNode`.
