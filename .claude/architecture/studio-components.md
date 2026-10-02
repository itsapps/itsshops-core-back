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
  variant-option groups into combinations; bundle composes existing variants with quantities.
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
  - `orderWithdrawal` → `WithdrawalResolveAction`, `WithdrawalResendAction`
  - `product` (feature `shop`) → `AddVariantsAction`
  - `category` (feature `shop.category.subcategories`) → a guarded delete that blocks deleting a
    category which still has subcategories (`createCustomDocumentAction`, a reusable
    query+validate wrapper in `components/actions/CustomDocumentAction.tsx`)
- **Consumer hook, last:** `ctx.config.documentActions?.(actions, context)` — lets a project add or
  wrap actions over the final core set. `withGeneratedZips` (exported from the package root) is the
  shipped example; Jurtschitsch uses it on `page`.

## Other custom components (`src/components/`)

- `PriceInput.tsx` — currency input; the **only** component re-exported publicly
  (`src/components/index.ts`). Used by the `priceField` builder.
- `OrderView.tsx` — the order document's overview view (totals, fulfillment, withdrawals).
- `StatusIcon.tsx`, `YoutubePreview.tsx`, `DeployDialog.tsx` (triggers a Netlify build via the
  Netlify integration env/config), and the `CustomToolbar` (studio `toolMenu`).

## Where each is wired (`src/index.ts`)

`layout` ← `ITSStudioWrapper` · `toolMenu` ← `CustomToolbar` · `tools` ← `createTools` ·
`document.actions` ← `actionResolver` · structure view components ← `createDefaultDocumentNode`.
