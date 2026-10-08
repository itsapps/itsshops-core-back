# Schema authoring: field factory & builders

How core schemas are written, and how to add/extend them. The payoff is that fields are
feature-aware, auto-translated, and validated with one-word shortcuts — you rarely hand-write a raw
Sanity field definition.

## A schema definition

Each schema in `src/schemas/{documents,objects,modules}/*.ts` is an `ITSDocumentDefinition` (or
object/array/image/file) — metadata plus a `build(ctx)`. `image`/`file` are named asset types
(e.g. `cropImage`, a customer `pdfFile` with `options.accept`); they share one builder branch:

```ts
export const category: ITSDocumentDefinition = {
  name: 'category',
  type: 'document',
  icon: CategoryIcon,
  feature: 'shop.category',           // feature-registry gate (omit = always on)
  disallowedActions: ['delete'],      // also: allowCreate, isSingleton, hideInStructure
  build: (ctx) => {                   // ctx: FieldContext = ITSContext + { f, factory, builders }
    const { f, builders } = ctx
    return ctx.builders.buildGroupedSchema([
      { name: 'infos', fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('description', 'i18nString'),
        f('sortOrder', 'number', { validation: (r) => r.positive() }),
      ]},
    ])
  },
}
```

## Build pipeline (`src/schemas/index.ts`)

`buildSchemas(ctx)` takes the feature-enabled objects+docs from the registry and runs
`createDefinition` on each:
1. `factory = createFactory(name, ctx)` and `builders = createBuilders(factory, ctx)`
2. `fieldCtx = { ...ctx, f: factory.fields, factory, builders }`
3. `definition.build(fieldCtx)` → core fields/groups/fieldsets
4. `shapeSchema(...)` merges the consumer's `config.schemaExtensions[name]` (extra fields, groups,
   fieldsets, `preview`, `icon`) into the core shape
5. `defineType(...)` emits the final Sanity type

Schema/document title & description also auto-resolve from the `schema` namespace
(`<name>.title` / `<name>.description`) when not given.

## The field factory `f` (`src/utils/fields.ts`)

`f(name, type = 'string', overrides)` — `createFieldFactory`. What it does beyond `defineField`:

- **Auto title/description** from the field translators (`fields.<name>.title` /
  `.description`) unless `title`/`description` is passed — see [localization.md](localization.md).
- **i18n type mapping** — `type: 'i18nString'` → `internationalizedArrayString` via
  `ctx.i18nFieldTypes`; `i18nString`/`i18nText` also get the AI translate action.
- **Feature-aware references** — for `reference` and `array`-of-reference, `to` targets are filtered
  to feature-enabled schema types (disabled types are dropped; if the only target is disabled the
  field/array item is removed), and `disableNew` is set when a target doc has `allowCreate === false`.
- **Option auto-translation** — a `string` field with an `options.list` gets each option's `title`
  filled from `fields.<name>.options.<value>`.
- **Portable-text** — `block` members in an array get styles/decorators/annotations auto-titled.
- **i18n validation shortcuts** via `overrides.i18n` (one or an array), backed by
  `src/utils/validation.ts` (`i18nValidators`):
  `'requiredDefault'` (require default locale), `'requiredDefaultWarning'`, `'requiredAll'`,
  `'atLeastOne'`, `'atLeastOneWarning'`, or an object → content-length limits. A plain
  `validation: (Rule) => …` still works and is combined.
- **Required subfields of an object field** —
  `requiredSubfields(fields, ctx.t.default, { warning?, message? })` (`src/utils/validation.ts`)
  marks each missing subfield on its own input; nested subfields via dot paths (`'address.zip'`);
  i18n subfields count as filled when any locale has a value. `warning: true` → non-blocking
  (generic "Empfohlen"); `message` passes a caller-specific translation key when the reason matters
  (e.g. `validation.companyDetailsRecommended`).
- **Feature-conditional rules** — pick the rule at build time, e.g.
  `validation: (rule) => (ctx.featureRegistry.isFeatureEnabled('shop') ? rule.required() : rule)`.

`createFactory` also returns `factory.reference(name, options)` (feature-filtered reference with
auto label) and `factory.fieldTranslators`.

## Reusable builders (`src/schemas/builders.ts`)

`createBuilders(factory, ctx)` → `ITSBuilders`, higher-level field groups composed on `f`. Use these
instead of re-deriving the same field clusters:

| Builder | Produces |
|---|---|
| `buildGroupedSchema(groups[])` | `{ groups, fields }` with each field assigned to its group (first group default) |
| `module({ fields, groups?, allowAnchor?, allowTheme? })` | wraps content fields and appends a `settings` group (`disabled`, optional `anchorId`, `theme`) — the standard page-module shape |
| `internalLinkFields` / `externalLinkFields` | reference/url link field clusters; internal is feature-aware with conditional-required validation, optional `displayType`, and opt-in `includeSystemPages` (fixed routes like the withdrawal form, as an alternative to the reference) |
| `actionGroup({ max?, … })` | an array of internal-link "actions" with a localized preview |
| `variantReferences` / `variantReference` | references to `productVariant` (filtered to non-archived, `disableNew`) |
| `priceField` | a positive `number` field rendered with the `PriceInput` component |
| `countryCodeField` / `countryCodesField` | country select(s) from `ctx.constants.countryOptions`; single variant adds an async cross-document uniqueness check |
| `filterField` | feature-aware product/wine/option filter array for the `productList` module |

## Extending from a consumer project

- **Add fields to a core schema** → `config.schemaExtensions['<docName>'] = { fields, groups?, fieldsets?, preview?, icon? }` (merged in `shapeSchema`).
- **Add a whole new document/object** → `config.documents` / `config.objects` (each an
  `ITSDocumentDefinition`/`ITSObjectDefinition` using the same `build(ctx)` + `f`/`builders` API).
- Gate anything custom with a `feature` tag rather than branching, so it follows the registry.
- Allowed reference targets are capped by `schemaSettings.links.allowedReferences` /
  `menus.allowedReferences`.
