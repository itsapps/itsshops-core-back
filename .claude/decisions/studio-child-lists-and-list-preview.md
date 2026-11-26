# Product / option group child lists and the product list preview

Status: accepted · Date: 2026-11-26

## Context
Editors couldn't tell same-named products apart, didn't see a product's image when only its
variants had one, and couldn't see whether a product's variants had unpublished drafts without
opening "Variants" (product → menu "Product / Variants / New variant" → variant list). Option
groups had the same extra "Options" step.

## Decision
- **Child lists:** clicking a product (or option group) opens one live `S.list()` built from
  `documentStore.listenQuery`: the document, its variants (options) as `documentListItem`s, a
  "New …" item. Rejected: a mixed `S.documentList` — Sanity validates every sort field against
  every type in it (`wine.*` doesn't exist on `product` → crash) and its default child infers the
  editor type from the filter; a custom `S.component` list — selection, keyboard navigation and
  accessibility would have to be rebuilt.
- **New documents** in such a list get their id in the route (`usePaneRouter().replaceCurrent`
  with the template in the pane params), never a made-up id in a child resolver (the live list
  re-resolves children when it re-emits) and never a `create` intent (resolved globally, it never
  reaches a nested pane).
- **List preview:** structure lists render `SanityDefaultPreview` directly (`components.preview`
  is ignored there) and `prepare` must return strings for title/subtitle. So the live variant
  summary lives in `media` (a React element): count badge, draft dot, tooltip + screen-reader
  text. Option group rows do the same (option count, draft dot; shared `PreviewCountMedia`).
  Rejected: a denormalized summary field on the product (needs a writer that runs on every
  variant change and would itself create product drafts); a custom list pane (as above).
- **`product.cmsTitle`** (internal name, Studio only) instead of deriving a distinguishing label:
  the grape variety lives in VinoFact, not in the dataset.

## Consequences
- One listener per rendered product row (shared by its media parts) and per open child list.
- The summary in the product row is limited to what fits on the image (count, draft dot); the
  details (status per variant) are one click deeper, in the child list.
- The pattern and its pitfalls: `architecture/studio-structure.md`, `studio-components.md`.
