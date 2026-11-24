# Schemas are gated by a `.feature` tag + the feature registry, not by branching

**Status:** Active
**Date:** 2026 (in code since the feature registry landed)

## Context

The same core plugin serves many customers with different enabled feature subsets (shop,
sub-features, product kinds, blog, users, newsletter). Which documents/objects/modules, structure
items, and document actions appear must vary per customer. Doing that with `if` branches scattered
through `buildSchemas`, the structure builder, and `actionResolver` would be repetitive and
easy to get out of sync.

## Decision

Each schema definition carries an optional **`feature: ITSFeatureKey`** tag. `createFeatureRegistry`
(`src/config/features.ts`) resolves the customer config into a `featureMap` and exposes
`isFeatureEnabled` / `featureFilter`: an untagged definition always passes; a tagged one is dropped
when its feature is off. The same registry gates structure items (`feature` on `ITSStructureItem`)
and contextual document actions. So **to make something conditional, tag it with a `feature`** rather
than branch.

## Consequences

- Adding or gating a schema/structure item is declarative and consistent; the registry is the single
  source of truth for "what's enabled."
- Product kinds (`shop.productKind.{wine,physical,digital,bundle}`) and `shop.category.subcategories`
  are derived feature keys driven by `schemaSettings` — see `features.ts`.
- The **frontend** feature flags are a subset of the backend's; keep both in mind for cross-repo
  features. See [schema-authoring.md](../architecture/schema-authoring.md) and
  [plugin-and-config.md](../architecture/plugin-and-config.md).
