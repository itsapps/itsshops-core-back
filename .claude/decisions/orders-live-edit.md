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

## Withdrawals (core-back, after 5.3.0)
`orderWithdrawal` is `liveEdit` too: "Erstatten & abschließen" set `status` on the published record,
and publishing an older draft reverted it (the stopgap disabled the action while a draft existed).
The catch was assigning an unmatched record: the editable `orderRef` field relied on the draft to
stay correctable and on validation to block publishing a second open withdrawal on the order.
Decision: **assigning is an action** ("Bestellung zuordnen") with a confirm step — the
open-withdrawal check runs there and can block, one revision-guarded patch sets `orderRef`,
`status` and `assignedAt` — plus an **undo** ("Zuordnung aufheben", only for Studio assignments,
i.e. `assignedAt` set, and only while `received`). Rejected: keep the field with a "still
correctable" flag. Why the undo: "Erstatten & abschließen" refunds whichever order is linked, and the
workaround ("Abgelehnt" + a new record on the right order) would strand the original web submission
(the proof of the declaration) on the wrong order. Upgrade: resolve withdrawal drafts per dataset
first (`*[_id in path("drafts.**") && _type == "orderWithdrawal"]`, raw perspective; a draft that
assigned an order → assign it with the action afterwards), then discard them.
