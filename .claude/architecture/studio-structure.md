# Studio structure (desk) & how consumers customize it

The left-hand desk is built from a **declarative manifest** (`ITSStructureItem[]`), not hand-written
`S.list()` calls. Consumers reshape it by passing their own manifest in `config.structure`, which is
merged into the core one — so reordering, renaming, hiding, and extending are all data, no need to
reimplement the structure.

## Core manifest (`src/config/structure.ts`)

`createStructure(ctx)` defines `coreManifest` — groups and items keyed by stable `id`s:
- `website` → page, post, menu
- `shop` (feature `shop`) → orders, products (custom pane), productVariant, variantOptions (custom),
  categories (custom), manufacturer, voucher, coupon
- divider
- `customers` (feature `shop`) → customer, customerGroup
- `newsletterGroup` (feature `newsletter`) → newsletterSubscriber
- `settingsGroup` → settings, blog, and nested `shopSettingsGroup` (shopSettings, tax…, shipping…)

Document items are resolved from the feature registry via `fromRegistry(ctx, id)` — which also reads
`schemaExtensions[id].icon` for an icon override and respects `isSingleton` / `hideInStructure`.

## Item types (`ITSStructureItem`)

`group` (has `children`), `document`, `singleton` (edits a fixed id), `divider`, `custom`
(`component: (S, context, ctx) => ListItem`). Every item may carry:
- `feature` — hidden unless that feature key is enabled
- `hidden` — hidden outside dev
- `title` — a `structure`-namespace translation key (default is `<id>.title`)
- `position` — ordering hint (see below)

## Merge + order (`src/structure/structure.ts`)

`localizedStructure(ctx, coreManifest)` runs at resolve time:
1. `mergeManifests(core, ctx.config.structure)` — matches customer items to core by `id`:
   same id → shallow-merge (override `title`, `icon`, `position`, …); both have `children` →
   **recursive** child merge; unknown id → appended as a new item.
2. `sortItems(...)` — applies `position`.
3. resolve each item to the Sanity structure builder (feature/hidden/doc-enabled guards; empty groups
   drop out entirely).

### `position` grammar
- `{ anchor: 'top' }` / `{ anchor: 'bottom' }` — pin to ends.
- `{ anchor: '<existing id>', placement: 'before' | 'after' }` — place relative to another item.
Anchored items are resolved iteratively (so you can anchor to an item that is itself anchored). A
typo in `anchor` is forgiving — the item is appended rather than dropped.

## Consumer recipes (`config.structure`)

```ts
structure: [
  // rename + reorder a core group
  { id: 'shop', title: 'catalog.title', position: { anchor: 'top' } },
  // add an item into an existing core group (recursive child merge by id)
  { id: 'website', children: [
    { type: 'document', id: 'landingPage', position: { anchor: 'page', placement: 'after' } },
  ]},
  // add a brand-new top-level group
  { type: 'group', id: 'marketing', icon: MyIcon, children: [{ type: 'document', id: 'campaign' }] },
  // a fully custom pane
  { type: 'custom', id: 'reports', component: (S) => S.listItem().title('Reports').child(/* … */) },
]
```
- **Reorder** → re-declare the id with a `position`.
- **Rename** → override `title` (or use `structureTranslationOverrides` in `i18n`).
- **Hide** → `{ id, hidden: true }` (visible in dev), or disable its feature.
- **Change icon** → `{ id, icon }`, or `schemaExtensions[id].icon` for the document itself.
- **Extend** → add items/groups/custom panes with new ids.

## Document views (`createDefaultDocumentNode`)

Per-type editor views:
- `order` → custom `OrderView` component view + the edit form.
- everything else → the form + a "references" pane (`getReferenceView`, a `*[references($id)]`
  DocumentsPane). `getProductReferenceView` exists for product→variant listings.

`createStructureTool(ctx)` bundles `{ title, structure, defaultDocumentNode }` and is handed to
`structureTool(...)` in `src/index.ts`. Custom per-menu panes live in `src/structure/`
(`products.ts`, `categories.ts`, `variantOptions.ts`).
