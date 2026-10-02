# Decisions (ADRs)

One file per non-obvious decision, named `<slug>.md`. Format: `# <title>`, then `Status` / `Date`,
then `Context` / `Decision` / `Consequences`. Only record a decision that's actually evidenced and
that future-you would otherwise re-litigate.

- [sanity-6-platform.md](sanity-6-platform.md) — on Sanity 6 / @sanity/ui v4 / React 19
- [feature-tagged-schemas.md](feature-tagged-schemas.md) — gate schemas/structure/actions with a
  `.feature` tag + the registry, not branches.
- [typegen-coexists-with-handwritten-types.md](typegen-coexists-with-handwritten-types.md) — the
  generated `sanity.types.ts` is load-bearing alongside the hand-written types; resync with
  `npm run types`.
