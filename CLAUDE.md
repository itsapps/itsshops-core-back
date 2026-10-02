# CLAUDE.md — itsshops-core-back

Entry point for any Claude session in this repo. Read this fully first, then load the `.claude/`
file that matches the task. `.claude/` is loaded on demand; this file is the always-loaded router.

| Working on… | Read next |
|---|---|
| Plugin wiring, workspaces, config mapping (`ItsshopsConfig`/`mapConfig`), feature registry | `.claude/architecture/plugin-and-config.md` |
| Schemas (documents, objects, modules) overview | `.claude/architecture/schemas.md` |
| Authoring/extending schemas — field factory `f`, builders, feature-aware refs, i18n validation | `.claude/architecture/schema-authoring.md` |
| Translation — field label auto-translation, i18n fields + AI translate, UI languages, overrides | `.claude/architecture/localization.md` |
| Studio desk structure + how consumers reorder/rename/hide/extend it | `.claude/architecture/studio-structure.md` |
| Custom studio components, `useITSContext`, tools, document actions, Product Manager | `.claude/architecture/studio-components.md` |
| Importing/exporting datasets, schema extract & typegen | `.claude/workflows/datasets.md` |
| Why a non-obvious choice was made (e.g. Sanity 6 platform) | `.claude/decisions/` |

Run `/update-docs` (see `~/.claude/commands/update-docs.md`) after changes that move paths, add a
schema/feature, or establish a rule.

The **frontend** counterpart is `@itsapps/itsshops-core-front`
(`/Users/kampfgnu/Documents/programming/jamstack/itsshops-core-front/CLAUDE.md`) — read its ecosystem
map for how customers consume both. Feature flags here are a **superset** of the frontend's.

---

## What this is

`@itsapps/itsshops-core-back` (package **v2.0.0**) — a **Sanity Studio plugin** distributed as an npm
package. Built on **Sanity 6 / `@sanity/ui` v4 / React 19**. Customer backends call
`createItsshopsWorkspaces(config)` and spread the result into their `sanity.config.ts`.

```ts
import { createItsshopsWorkspaces } from '@itsapps/itsshops-core-back'
export default createItsshopsWorkspaces(config)   // config: ItsshopsConfig → WorkspaceOptions[]
```

One workspace is generated **per UI locale** (basePath `/<locale>`), each running `itsshopsPlugin`.

## Commands

```bash
npm run build       # plugin-kit verify-package + pkg-utils build (strict)
npm run watch       # pkg-utils watch (consumers npm link this)
npm run link-watch  # plugin-kit link-watch
npm run start       # sanity dev (host 0.0.0.0, port 3331) — core's own studio
npm run test        # vitest
npm run extract     # sanity schema extract --workspace de  → schema.json (input to typegen)
npm run typegen     # sanity typegen generate                → src/types/sanity.types.ts (used; see datasets.md)
npm run lint / format
```

Develop against a customer backend via `npm link` (no yalc). See
`.claude/architecture/plugin-and-config.md` for the npm-link gotcha (customer-side vite dedupe).

**Git workflow:** develop on `main` (+ feature branches) with **your own GitHub user**. Core is a
library consumed as a git dependency and is never deployed to Netlify, so no customer-identity / PAT
applies here (that's only for customer repos). Consumption/release: core-front's
`.claude/workflows/consuming-core-and-deploy.md`.

## Entry point (`src/index.ts`)

- `itsshopsPlugin = definePlugin<ITSContext>(...)` — assembles the Sanity plugin: internationalized
  array, structure tool, vision (dev only), media, presentation, translation bundles, `@sanity/assist`
  (field translation for enabled doc types), schema (`buildSchemas` + `templateResolver`), tools,
  studio layout (`ITSStudioWrapper`) + custom toolbar, document actions (`actionResolver`). Comments,
  releases, and scheduledDrafts are disabled.
- `createItsshopsWorkspaces(config)` — `mapConfig(config)` → `CoreBackConfig`, builds a translator,
  a **feature registry**, and i18n field types, then maps over `localization.uiLanguages` to produce
  one `WorkspaceOptions` per locale, each with its own translators, localizer, format helpers,
  country/volume option constants, and an `ITSContext`.

## Source layout

```
src/
├── index.ts         # plugin definition + createItsshopsWorkspaces
├── config/          # mapper, features (registry), fieldTypes, structure, templates, actions, tools, theme, localization, constants/
├── schemas/         # documents/ · objects/ · modules/ (+ index buildSchemas)
├── components/      # studio React components (CustomToolbar, actions/, products/)
├── context/         # ITSStudioWrapper and studio context
├── presentation/    # presentation-tool (visual editing) config
├── localization/    # translator, i18n helpers, format helpers, sanityTranslation bundles, resources/
├── structure/       # desk structure building blocks
├── lib/             # shop/ (productVariant tx) + hooks/ (price input, product transaction)
├── external/        # externally re-exported surface
└── types/           # ItsshopsConfig, context, registry, schema, blocks, fields, mail, netlify, vinofact (hand-written) + sanity.types.ts (typegen-generated, used via the barrel — see datasets.md)
```

## Config: `ItsshopsConfig`

Customer backends extend core via `ItsshopsConfig`: `documents[]`, `objects[]`, `schemaExtensions`,
`structure[]`, `i18n`, plus `features` and `schemaSettings` (e.g. `productKinds`). `mapConfig` turns
it into the internal `CoreBackConfig`. Field list lives in `src/types/` (`config`, `registry`,
`schema`).

## Feature flags (superset of frontend)

Resolved by `createFeatureRegistry` (`src/config/features.ts`) into a `featureMap`; schemas carry an
optional `.feature` tag and are filtered out when their feature is disabled.

```
shop, shop.manufacturer, shop.stock, shop.category, shop.category.subcategories,
shop.vinofact, shop.vouchers, shop.coupons,
shop.productKind.{wine,physical,digital,bundle}, shop.productKind.options  (physical|digital),
blog, users, newsletter
```

`shop.productKind.*` is driven by `schemaSettings.productKinds`; `options` is on when physical or
digital is enabled.
