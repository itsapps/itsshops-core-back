# Plugin wiring & config

## Two public exports (`src/index.ts`)

1. **`itsshopsPlugin`** — `definePlugin<ITSContext>`. Given an `ITSContext`, returns the Sanity
   plugin object. Composes:
   - `internationalizedArray` (languages + `localizedFieldTypes`, `buttonAddAll: false`)
   - `structureTool(createStructureTool(context))` (`src/config/structure.ts`)
   - `visionTool()` — **dev only** (`context.config.isDev`)
   - `media()`
   - `presentationTool(createPresentations(...))` (`src/presentation/`)
   - translation package + i18n bundles (`src/localization/sanityTranslation.ts`)
   - `assist({ translate: { field: { documentTypes: <enabled docs>, languages } } })`
   - `schema.types = buildSchemas(context)`, `schema.templates = templateResolver`
   - `tools = createTools(context)`
   - studio layout `ITSStudioWrapper(context)` + `CustomToolbar`
   - `document.actions = actionResolver`
   - **disabled:** comments, releases, scheduledDrafts

2. **`createItsshopsWorkspaces(config)`** — the function customers call. Flow:
   - `mapConfig(config)` → `CoreBackConfig` (`src/config/mapper.ts`)
   - `createTranslator(...)` (`src/localization/`) — per-namespace translators (`schema`,
     `structure`, `components`)
   - `createFeatureRegistry(coreConfig)` (`src/config/features.ts`)
   - `createi18nFieldTypes(localizedFieldTypes)` (`src/config/fieldTypes.ts`)
   - `uiLanguages.map(language => …)` → one `WorkspaceOptions` per locale:
     - `name`/`basePath` = locale, `projectId`/`dataset` from config
     - builds per-locale `localizer`, `format`, `countryOptions`, `volumeOptions`
       (from `BOTTLE_VOLUMES_ML`), and the `ITSContext`
     - `plugins: [itsshopsPlugin(context)]`

So **one studio workspace per UI locale**, each a full instance of the plugin with its own
translators and localizer.

## ITSContext

The object threaded through everything: `{ config, featureRegistry, locale, localizer, format,
constants: { countryOptions, volumeOptions }, i18nFieldTypes, t/schemaT/structureT/componentT }`.
Defined in `src/types/context.ts`.

## Feature registry (`src/config/features.ts`)

`createFeatureRegistry(config)`:
- collects core docs/objects (`getCoreDocuments`, `getCoreObjects`) merged with customer
  `config.documents` / `config.objects`
- builds a `featureMap: Record<ITSFeatureKey, boolean>` (see CLAUDE.md for the key list)
- `isFeatureEnabled(key)` + `featureFilter(definition)` — a schema definition with a `.feature` tag
  is dropped when that feature is off; untagged definitions always pass
- exposes `getEnabledDocs()` (used e.g. to scope `@sanity/assist` translation)

To make a schema conditional, tag it with `feature: '<ITSFeatureKey>'` rather than branching in
`buildSchemas`.

## Config mapping (`src/config/mapper.ts`)

`mapConfig(ItsshopsConfig) → CoreBackConfig`. This is "how the config works" — it normalizes the
customer `ItsshopsConfig` into the internal `CoreBackConfig` that the whole plugin reads.

**`ItsshopsConfig` (what a customer passes):**
- `settings: { isDev, ignoreExtensions }`
- `projectId` / `dataset` / `workspaceName` / `workspaceIcon`
- `features` — `FeatureConfig` (see the flag list in `CLAUDE.md`)
- `i18n` — `{ ui?, fields?, defaultLocale?, localizedFieldTypes?, fieldTranslationOverrides?, structureTranslationOverrides?, translationOverrides? }` (see [localization.md](localization.md))
- `documents` / `objects` — extra schemas (`ITSDocumentDefinition[]` / `ITSObjectDefinition[]`)
- `schemaExtensions` — per-schema field/group/preview/icon additions (see [schema-authoring.md](schema-authoring.md))
- `structure` — desk manifest overrides (see [studio-structure.md](studio-structure.md))
- `schemaSettings` — `{ links.allowedReferences, menus.{disableSubmenus,maxDepth,allowedReferences}, productKinds }`
- `documentActions` — consumer action hook (see [studio-components.md](studio-components.md))
- `integrations.vinofact` — VinoFact credentials

**Resolution rules (`mapConfig`):**
- precedence for ids: `config.projectId ?? SANITY_STUDIO_PROJECT`; dataset ←
  `SANITY_STUDIO_DATASET`; workspace name ← `SANITY_STUDIO_WORKSPACE_NAME`.
- `localizedFieldTypes` = base `i18nFieldTypes` + customer additions.
- `schemaSettings` = core defaults `deepMerge` customer. **Throws** if `shop` is enabled but
  `productKinds` is empty.
- `apiVersion` is pinned to `v2025-05-25`.
- `integrations.netlify` is read entirely from `SANITY_STUDIO_NETLIFY_*` env; `integrations.vinofact`
  from `config.integrations.vinofact` or `SANITY_STUDIO_VINOFACT_*` env (only when vinofact is on).

**`ignoreExtensions: true` (the superset switch):** set by the root `sanity.config.ts` for local
schema dev / typegen. It forces `allFeatures()` (every feature on), uses base `localizedFieldTypes`
only, and **discards** customer `documents`/`objects`/`structure`/`schemaExtensions`/overrides — so
the generated schema is the full core superset, independent of any customer's actual config. Customer
studios run with `ignoreExtensions: false` → `normalizeFeatures()` (everything off unless opted in).

## npm-link gotcha (customer side)

When a customer backend consumes this package via `npm link`, React/Sanity can get duplicated,
breaking hooks. The fix lives in the **customer's** `sanity.cli.ts` (vite `resolve.dedupe` for
`react`, `react-dom`, `sanity`, `styled-components`), **not** in this repo's `sanity.cli.ts` (which
stays minimal). Check there if a linked studio throws invalid-hook-call errors.
