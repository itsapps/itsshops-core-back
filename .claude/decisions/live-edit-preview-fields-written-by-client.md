# liveEdit: preview fields are written by the client, not the form

Status: accepted · Date: 2026-11-09 (core-back, withdrawal editor flow)

## Context
`orderWithdrawal` is `liveEdit`. Its status input first saved through the form
(`useDocumentOperation(…).patch`, then the field's `onChange`). Every save reached the dataset
within a second (checked in the document history), but the desk list preview ("Offen" list:
"09.11.2026 · In Bearbeitung") showed the new status only sometimes — otherwise not until a reload.
Orders, also `liveEdit` but changed only by document actions (`sanityClient.patch().commit()`),
always updated; `/data/listen` was healthy.

Cause, from the Studio source (`sanity` 6.9.2, `datastores-*.js`): the document store commits form
edits with `visibility: "async"`. The preview store refetches a document's preview fields on each
listener event — at once for `visibility: "query"` events, otherwise after a 1 s debounce — and that
fetch can still read the pre-change query index; the stale value then stays until the next change.
Without `liveEdit` the editor's local draft feeds the preview, which hides this.

## Decision
On a `liveEdit` document, a custom input that changes a field shown in the list preview writes with
the client (`sanityClient.patch(id).set(…).commit()`, default sync visibility) — the same path as the
document actions. `WithdrawalStatusInput` does this (and sets `status` + `note` in one patch on
rejection). Plain editor fields that aren't in the preview keep the normal form path.

## Consequences
The input doesn't update optimistically: it is disabled while saving and shows the value once the
listener delivers it; save errors are shown below it. If a Sanity upgrade changes the preview
refetch, this can be re-checked (toggle a status fast several times, the list must follow).
