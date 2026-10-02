# Workflow: datasets & typegen

## Export / import a dataset (from README)

Login first: `npx sanity login`

```bash
# export a dataset to a local tar.gz
SANITY_IMPORT_TOKEN=<token> npx sanity dataset export <dataset> out.tar.gz -p <projectId>

# import a local tar.gz into a dataset
SANITY_IMPORT_TOKEN=<token> npx sanity dataset import dev.tar.gz <dataset> -p <projectId>
```

Import **replaces/merges** into the target dataset — double-check the target name before running.

## Schema extract & typegen — IS load-bearing (don't remove)

```bash
npm run types     # extract --force && typegen — the one command to resync (use this)
# individually:
npm run extract   # sanity schema extract --workspace de --force → schema.json (gitignored; input to typegen)
npm run typegen   # sanity typegen generate                      → src/types/sanity.types.ts
```

**Run `npm run types` after changing any document/module/object in `src/schemas/`, and commit the
regenerated `src/types/sanity.types.ts`.** The types are a manual snapshot — `npm run build` does
NOT refresh them, so they drift silently if you skip this (that's how a stale 93-type version got
committed; current source yields 115).

Mechanics:
- `extract` builds `schema.json` from the **root `sanity.config.ts`** workspace `de`, which runs with
  `ignoreExtensions: true` → the full feature superset. So the types cover all core
  documents/modules/objects regardless of feature flags. Customer `schemaExtensions` / custom
  documents are NOT included (they'd need typegen in the customer repo).
- `--force` is required because `extract` refuses to overwrite an existing `schema.json`.
- output path is set by `sanity-typegen.json` (`"generates": "./src/types/sanity.types.ts"`);
  without that config typegen writes to `./sanity.types.ts` in the repo root.
- `schema.json` is transient and `.gitignore`d; `src/types/sanity.types.ts` is tracked and committed.
- verified 2026-10-01: a fresh extract-from-source + typegen is byte-identical to the committed
  types, i.e. they are in sync with current schema.

Two-step flow: `extract` writes `schema.json` which `typegen` reads to regenerate
`src/types/sanity.types.ts`.

**`sanity.types.ts` is used — removing it breaks the build (verified 2026-10-01).** It's re-exported
from the barrel `src/types/index.ts` (`export * from './sanity.types'`) and its generated schema
types are imported through that barrel by real code — e.g. `Product`, `ProductVariant`,
`TaxCategory`, `Wine`, `VariantOption`, `VariantOptionReference`, `InternationalizedArrayString`
(in `src/schemas/documents/productVariant.ts`, `src/components/products/*`), and `Order`
(`src/components/StatusIcon.tsx`).

Subtlety worth knowing: for several of these names the generated file is the **only** reachable
source, because the hand-written equivalent isn't re-exported — e.g. `src/types/orders.ts` declares
its own `Order` but its barrel line is commented out (`// export * from './orders'`), so `Order`
resolves to the typegen one. A name appearing in a `src/types/*.ts` file does **not** mean it's
exported from the barrel. (This is the trap that made an earlier "dead code" read wrong.)

The **frontend** carries no copy of these types — it defines its own resolved shapes.

## Run the core studio locally

`npm run start` → `sanity dev` on `0.0.0.0:3331`. For plugin development against a customer, prefer
`npm run watch` + `npm link` in the customer backend (see plugin-and-config doc for the dedupe
gotcha).
