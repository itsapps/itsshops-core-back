# Plugin wiring & config

## Two public exports (`src/index.ts`)

1. **`itsshopsPlugin`** — `definePlugin<ITSContext>`. Given an `ITSContext`, returns the Sanity
   plugin object. Composes:
   - `internationalizedArray` (languages + `localizedFieldTypes`, `buttonAddAll: false`)
   - `structureTool(createStructureTool(context))` (`src/config/structure.ts`)
   - `visionTool()` — **dev only** (`context.config.isDev`)
   - `media()`
   - `presentationTool(createPresentations(...))` (`src/presentation/`)
     — `previewUrl.initial` = `<netlify.endpoint>/api/preview/<locale>` (core-front renders the
     home page), `previewMode: { enable: '/api/preview-enable', shareAccess: false }` (core-front
     validates Sanity's preview secret; no share-access links). Flow: core-front
     `commerce-and-netlify.md` → "Draft preview".
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
     - builds per-locale `localizer`, `format`, `countryOptions`, `allCountryOptions`, `volumeOptions`
       (from `BOTTLE_VOLUMES_ML`), and the `ITSContext`
     - `plugins: [itsshopsPlugin(context)]`

So **one studio workspace per UI locale**, each a full instance of the plugin with its own
translators and localizer.

## ITSContext

The object threaded through everything: `{ config, featureRegistry, locale, localizer, format,
constants: { countryOptions, allCountryOptions, volumeOptions }, i18nFieldTypes, t/schemaT/structureT/componentT }`.
Defined in `src/types/context.ts`.

**Which country list** (owner's rule, 2026-11-05; why: [../decisions/country-lists-shop-vs-all.md](../decisions/country-lists-shop-vs-all.md)) — both in `src/config/constants/countries.ts`:
- `countryOptions` — the shop's countries (today: geographic Europe, the 52 codes in
  `EUROPE_COUNTRY_CODES`; `createCountries` names them per UI locale, `flagEmoji` makes the
  tax-country preview flag). For what the shop **sells/delivers to or is**: tax countries, shipping,
  order addresses (`addressStrict`), the shop's own address (`businessAddress`).
- `allCountryOptions` — every ISO country (`createAllCountryOptions`, names from
  `Intl.DisplayNames` like core-front's `countryList` filter). For where a **person lives**: the
  customer account (`address`), a customer's interest list. Matches the frontend forms, which offer
  every country (registration, interest form).
- Open: the checkout billing address could take every country too (VAT follows the delivery
  country); parked — core-front `.claude/plans/billing-address-all-countries.md`.

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
- `schemaSettings` — `{ links.allowedReferences, menus.{maxDepth,allowedReferences}, productKinds }`
  (`menus.maxDepth` = menu levels, top level included — `schemas.md` → "Menu levels")
- `documentActions` — consumer action hook (see [studio-components.md](studio-components.md))
- `integrations.vinofact` — VinoFact `{ endpoint, profileSlug }` (public values; the token is a
  secret, below)

**Resolution rules (`mapConfig`):**
- precedence for ids: `config.projectId ?? SANITY_STUDIO_PROJECT`; dataset ←
  `SANITY_STUDIO_DATASET`; workspace name ← `SANITY_STUDIO_WORKSPACE_NAME`.
- `localizedFieldTypes` = base `i18nFieldTypes` + customer additions.
- `schemaSettings` = core defaults `deepMerge` customer. **Throws** if `shop` is enabled but
  `productKinds` is empty.
- `apiVersion` is pinned to `v2025-05-25`.
- `integrations.netlify` = `{ siteId, projectName, endpoint }` from `SANITY_STUDIO_NETLIFY_SITE_ID` /
  `_PROJECT_NAME` / `_FUNCTIONS_ENDPOINT`; `integrations.vinofact` = `{ endpoint, profileSlug }`
  from `config.integrations.vinofact` or `SANITY_STUDIO_VINOFACT_API_URL` / `_PROFILE_SLUG` (only
  when vinofact is on). All of it is in the public bundle — public values only (rule in `CLAUDE.md`
  → "Config").

### Secrets (`@sanity/studio-secrets`)

Credentials the Studio must send live in the dataset document **`secrets.itsshops`** (type
`pluginSecrets`, field `secrets`; namespace + keys in `src/types/secrets.ts`): `functionsSecret`
(= the frontend's `SERVER_FUNCTIONS_SECRET`, refunds + mails), `netlifyBuildHook` (Deploy button),
`vinofactToken` (vinofact only). The dotted id makes it readable by **logged-in members only** —
also in a public dataset — but by **every** member, viewers included (custom roles need
Enterprise), so core-front's endpoints validate everything themselves. Per dataset:
`development` = staging values, `production` = live values. It is part of every dataset export
(backups). Read in `ITSCoreProvider` / `DeployDialog` with `useSecrets`; written by
`IntegrationsDialog` (studio-components.md). No Netlify account token anywhere — Deploy posts to a
build hook. Why: `decisions/studio-secrets-in-dataset.md`.

Needs **one** `@sanity/ui` copy (studio-secrets depends on `^4.4.10`; two copies split the theme
context) — check `npm ls @sanity/ui` in core-back and each customer backend after a pin.

**`ignoreExtensions: true` (the superset switch):** set by the root `sanity.config.ts` for local
schema dev / typegen. It forces `allFeatures()` (every feature on), uses base `localizedFieldTypes`
only, and **discards** customer `documents`/`objects`/`structure`/`schemaExtensions`/overrides — so
the generated schema is the full core superset, independent of any customer's actual config. Customer
studios run with `ignoreExtensions: false` → `normalizeFeatures()` (everything off unless opted in).

## npm-link gotcha (customer side)

When a customer backend consumes this package via `npm link`, React/Sanity can get duplicated,
breaking hooks. The fix lives in the **customer's** `sanity.cli.ts` (vite `resolve.dedupe` for
`react`, `react-dom`, `sanity`, `styled-components`, `@sanity/ui`; copy Jurtschitsch's
`sanity.cli.ts`), **not** in this repo's `sanity.cli.ts` (which
stays minimal). Check there if a linked studio throws invalid-hook-call errors.

The same duplication hits **types**: the link points at the whole core repo, so `dist/index.d.ts`
resolves `sanity` from core's own `node_modules` first. When that version differs from the
customer's, `tsc` fails in `sanity.config.ts` (`WorkspaceOptions[]` not assignable to `Config`, deep
down `SanityClient` `#private`); the build still works. `preserveSymlinks` doesn't help. Fix in the
customer's `tsconfig.json` `paths` (subpaths point at `lib/`, as `paths` ignores `exports`):
`"sanity": ["./node_modules/sanity"]`, `"sanity/*": ["./node_modules/sanity/lib/*"]`
(Rosi Schuster, 2026-10-29).
