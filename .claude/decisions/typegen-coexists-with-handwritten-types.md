# Generated `sanity.types.ts` coexists with the hand-written types — and is load-bearing

**Status:** Active (clarified 2026-10-02)
**Date:** 2026-10-02

## Context

core-back has **two** type systems for Sanity data:
1. hand-written types in `src/types/*.ts` (the primary set, ~199 types), and
2. typegen-generated `src/types/sanity.types.ts` (115 schema types), produced by `sanity typegen`.

A 2026-10-02 investigation initially mis-read the generated file as dead code (a flawed grep: a type
name existing in some `src/types/*.ts` file was taken to mean it's exported by the barrel). **Removing
it broke the build.** Several names are reachable *only* through the generated file via the barrel —
`Product`, `ProductVariant`, `VariantOption`, `VariantOptionGroup`, `VariantOptionReference`,
`TaxCategory`, `Wine`, `InternationalizedArrayString`, and `Order`. For `Order` specifically,
`src/types/orders.ts` also defines it, but that file's barrel line is commented out
(`// export * from './orders'`), so the typegen `Order` is the one exported.

The generated file had also drifted (committed 93 types vs 115 from current schema) and typegen was
writing to the repo root instead of `src/types/`.

## Decision

Keep both type systems; the generated `sanity.types.ts` is load-bearing and committed. Fixed the
output path with a `sanity-typegen.json` (`"generates": "./src/types/sanity.types.ts"`). Resync after
any schema change with **`npm run types`** (`extract --force && typegen`) and commit the result.

## Consequences

- There is genuine overlap/duplication between the two systems (e.g. two `Order` definitions) — live
  with it; don't delete `sanity.types.ts`.
- When deciding "is symbol X used?", trust the **compiler/build**, not grep — `export *` barrel
  reachability is not visible to a name search. (That mistake is why this ADR exists.)
- `sanity.types.ts` is internal (no `exports` subpath). Full workflow in
  [datasets.md](../workflows/datasets.md); the Sanity-6 platform note is in
  [sanity-6-platform.md](sanity-6-platform.md).
