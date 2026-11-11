# Decisions (ADRs)

One file per non-obvious decision, named `<slug>.md`. Format: `# <title>`, then `Status` / `Date`,
then `Context` / `Decision` / `Consequences`. Only record a decision that's actually evidenced and
that future-you would otherwise re-litigate.

- [sanity-6-platform.md](sanity-6-platform.md) — on Sanity 6 / @sanity/ui v4 / React 19
- [menu-levels-as-types.md](menu-levels-as-types.md) — one menu item type per level (`menuItem`,
  `menuItem1`, …); `maxDepth` counts levels incl. the top level, in both cores.
- [feature-tagged-schemas.md](feature-tagged-schemas.md) — gate schemas/structure/actions with a
  `.feature` tag + the registry, not branches.
- [typegen-coexists-with-handwritten-types.md](typegen-coexists-with-handwritten-types.md) — the
  generated `sanity.types.ts` is load-bearing alongside the hand-written types; resync with
  `npm run types`.
- [named-file-types.md](named-file-types.md) — upload-restricted (localized) files are named
  `type: 'file'` definitions (`ITSFileDefinition`), not a customer-side plugin.
- [country-lists-shop-vs-all.md](country-lists-shop-vs-all.md) — every country where a person
  lives (customer address), the shop's list where it sells/delivers (tax, shipping, orders).
- [orders-live-edit.md](orders-live-edit.md) — orders and withdrawals save without drafts, so a
  publish can't revert what functions/actions wrote; withdrawals are assigned by an action (with
  undo) instead of an editable field; discard old drafts on upgrade.
- [live-edit-preview-fields-written-by-client.md](live-edit-preview-fields-written-by-client.md) —
  on a `liveEdit` document, a custom input that changes a list-preview field writes with a sync
  client commit, not the form (async form commits leave the desk preview stale).
