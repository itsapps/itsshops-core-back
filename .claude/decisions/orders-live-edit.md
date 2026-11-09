# Orders are `liveEdit`

Status: accepted · Date: 2026-11-09 (core-back 5.3.0)

## Context
Payment functions (core-front webhook, `payment-refund`, wc-api) write the **published** order
(`paymentStatus`, `statusHistory`, `refunds`; core-front's client reads `published`). Editors also
change a few fields in the Studio (e.g. `fulfillment.trackingCode` — Tinhof's interim wineNET
process). Without `liveEdit` such an edit opens a draft — a copy of the order from when editing
started — and publishing it overwrites whatever the functions wrote meanwhile. Writing function
data to the published doc *and* an open draft was considered and rejected (double writes in every
writer, still racy).

## Decision
`order` returns `liveEdit: true` from its `build` (`src/schemas/documents/orders/order.ts`; the
schema factory spreads `build()` into `defineType`, no new option needed). Edits save straight to
the published order; there is no "Publish" button for orders. The Studio actions already patched
the published id, and `OrderView` reads `displayed ?? published` (now the same document).

## Consequences
Before upgrading a dataset to 5.3.0, existing order drafts must be resolved by hand — carry wanted
edits into the published order, then **discard** the draft (publishing it reverts function
writes). Find them with a raw-perspective query (`*[_id in path("drafts.order-**")]`; core-front's
`itsshops sanity` CLI doesn't see drafts). Shop owners lose the Publish step for orders (tell them
on upgrade). The frontend reads orders only through functions, so nothing renders early.
