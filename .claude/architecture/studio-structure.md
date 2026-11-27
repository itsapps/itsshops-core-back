# Studio structure (desk) & how consumers customize it

The left-hand desk is built from a **declarative manifest** (`ITSStructureItem[]`), not hand-written
`S.list()` calls. Consumers reshape it by passing their own manifest in `config.structure`, which is
merged into the core one — so reordering, renaming, hiding, and extending are all data, no need to
reimplement the structure.

## Core manifest (`src/config/structure.ts`)

`createStructure(ctx)` defines `coreManifest` — groups and items keyed by stable `id`s:
- `website` → page, post, menu
- `shop` (feature `shop`) → orders, withdrawals (custom `structure/withdrawals.ts`, id
  `orderWithdrawal`: "Offen" = unmatched/received/processing by `declaredAt` asc, "Erledigt" =
  refunded/rejected newest first; both `canHandleIntent` for `orderWithdrawal` so the order view's
  links resolve), orderMeta, products (custom pane), productVariant, variantOptions (custom),
  categories (custom), manufacturer, voucher, discount
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
- `title` — a `structure`-namespace translation key (default is `<id>.title`); a customer's **new** item
  needs that key in its own `i18n` (`structure: { <id>: { title } }` per locale) — without it the
  desk shows the raw key (e.g. `event.title`)
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
  DocumentsPane). `getProductReferenceView` (product→variants, published only) exists but is
  unused — variants are in the product child list (below).

**Product child list (`src/structure/products.ts`):** clicking a product opens one `S.list()` built
from a `documentStore.listenQuery` (product item, divider, one `documentListItem` per variant,
divider, "New variant" → `AddVariantsPane`). Not a mixed `S.documentList`: Sanity validates every
sort field against every type in it (`wine.*` doesn't exist on `product` → crash). Variant order:
`VARIANT_ORDER` (`src/utils/variantOrder.ts`, shared with the product preview).
The same live query reads whether the product exists (draft or published). Products are only
created by the Product Manager (the list has no "New"), so a missing product was deleted: the
list becomes `DeletedDocumentPane` (`src/components/`, text via `options.text`: "Dieses Produkt
wurde gelöscht.") — otherwise its product
item stays as "Missing document" and its editor would create a new product with the deleted id.
**Pitfall:** `listenQuery` only re-fetches on mutations matching the query's filter; with a
string query here that's the variants only, so the product's deletion never arrived. Pass
`{ fetch, listen }` with a `listen` filter that also matches the product (`_id in [$productId,
"drafts." + $productId]`).

**Option group child list (`src/structure/variantOptions.ts`):** same pattern — group item,
options (by `sortOrder`), "New option". Pitfalls found on the way, apply to any such list:
- A live `S.list()` re-resolves its children when it re-emits: a child that makes up an id
  (`crypto.randomUUID()`) gets a new one on the first edit. New documents get their id in the
  route instead: `NewVariantOptionPane` calls `usePaneRouter().replaceCurrent({ id, params:
  { type, template }, payload: templateParams })` — what an intent sets; the document pane reads
  the template from there and only creates the document on the first edit.
- `create` intents (a menu item or a documentList's "+") resolve **globally** and only descend
  through plain lists, never into a documentList's children — they can't reach a nested pane
  (panes reset, or the wrong list opens with the new id).
- An explicit `.child()` on the list resolves every id (group → `variantOptionGroup`, else
  `variantOption`), also a new option not yet in the items. A mixed documentList's default
  child infers the editor type from the filter — the group opened with the option's form.
- The group list's own "+" passes `params.template` to its child: then open the group's editor,
  not the list ("Missing document"). **Decide that inside the live stream, not when resolving:**
  Sanity caches a resolved pane per id + position (`hashContext`), **without the pane params**,
  and keeps it while you click through sibling groups — a resolve-time choice stuck, so a saved
  new group reopened from the list still showed its form. `getGroupChildView` wraps the query in
  `defer` and fixes the mode on its first result per subscription (new + not existing → editor,
  else list); reopening re-subscribes (Sanity's `publishReplay` + `refCount` reconnects), and the
  group exists by then → list. The first edit of a new group must not swap its editor away, hence
  "fixed per subscription".
- Like the product list: `listen` also matches the group itself, and a group that is gone shows
  `DeletedDocumentPane` ("Diese Optionengruppe wurde gelöscht.").
- Both lists `distinctUntilChanged` on what they show: `listen` fires on every keystroke in an
  editor below them.

`createStructureTool(ctx)` bundles `{ title, structure, defaultDocumentNode }` and is handed to
`structureTool(...)` in `src/index.ts`. Custom per-menu panes live in `src/structure/`
(`products.ts`, `categories.ts`, `variantOptions.ts`). Category lists (top-level and subcategory
panes) default-order by `sortOrder` asc, then `_createdAt`.
