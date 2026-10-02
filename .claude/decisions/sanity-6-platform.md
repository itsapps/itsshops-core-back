# On Sanity 6 / @sanity/ui v4 / React 19

**Status:** Active (package v2.0.0)
**Date:** 2026 (ongoing migration)

## Context

core-back is a Sanity Studio plugin. The platform was migrated from Sanity 5 to **Sanity 6**, which
pulls in `@sanity/ui` v4 and React 19 (`react`/`react-dom` ^19.2, `@types/react` ^19). The `v2.0.0`
major and the `v2-incompatible.js` guard in the repo root mark this boundary.

## Decision

Target Sanity 6 / `@sanity/ui` v4 / React 19 across core-back and all customer backends that consume
it. `@sanity/ui` v4 and React 19 APIs are used directly in studio components — do not write against
v3/React-18 patterns.

## Consequences

- Customer backends must be on the same Sanity 6 / React 19 line to consume this package.
- When a customer `npm link`s core-back, React/Sanity/styled-components can get duplicated and throw
  invalid-hook-call errors. Resolve via `resolve.dedupe` in the **customer's** `sanity.cli.ts` (vite
  config), not in core-back's (which stays minimal). See
  `.claude/architecture/plugin-and-config.md`.
- Icons go through the central icon module convention — never import `@sanity/icons` directly in
  arbitrary files.
