# Localization & translation

Two distinct translation layers — don't conflate them:

1. **Static label translation** — studio chrome, schema field labels, structure/menu titles, custom
   component strings. i18next + bundled resource files.
2. **Content translation** — the actual document field *values*. Stored as internationalized arrays
   and translated by editors, with an AI-assist "translate" button on i18n fields.

## Layer 1: static labels (i18next)

### Resources
`src/localization/resources/{fields,structure,components}_{de,en}.ts` — core ships **de + en only**.
Three i18next namespaces:
- `schema` ← `fields_*` — field labels/descriptions/option titles (default namespace)
- `structure` ← `structure_*` — desk/menu group titles, document-node view titles
- `components` ← `components_*` — strings for custom studio components/tools

### The translator (`src/localization/createTranslator.ts`)
`createTranslator({ isDev, fallbackLng, supportedLngs, overrides })` builds one i18next instance
(resources merged with consumer overrides via `flattenAndMerge`) and returns a factory
`(namespace, locale) => ITSTranslator`:
- `.default(key, fallback?, params?)` → translation, else `fallback`, else the `key`. **In dev, when
  a fallback is used it's suffixed with `[key]`** so missing keys are visible in the studio.
- `.strict(key, params?)` → translation or `null`/`undefined` (missing keys resolve to `null` via
  `parseMissingKeyHandler`).

Per-namespace translators are put on `ITSContext` in `createItsshopsWorkspaces` (`src/index.ts`):
`t`/`schemaT` (schema ns), `structureT` (structure ns), `componentT` (components ns). Use the one
matching what you're labeling.

### Field label auto-translation (`src/localization/fieldTranslators.ts`)
This is the "fields are kinda auto-translated" mechanism. `createFieldTranslators(namespace, t)`
resolves a label **by convention** — no explicit `title` needed on a field:
- tries the **local** keypath `${namespace}.fields.${fieldName}.title`, then the **global**
  `fields.${fieldName}.title`, then falls back to the raw `fieldName`.
- `.option({fieldName, value})` → `fields.<field>.options.<value>`
- `.block(...)` auto-titles portable-text styles / decorators / annotations.

So naming a field `price` makes the factory look up `fields.price.title` in the resource files. Add
the label once to `fields_de`/`fields_en` and every `f('price', …)` across all schemas picks it up.
(Consumed by the field factory — see [schema-authoring.md](schema-authoring.md).)

## Layer 2: content values (i18n fields + AI assist)

### i18n field types — the `i18nString` shortcuts (`src/config/fieldTypes.ts`)
`i18nString` et al. are **short aliases for the long `internationalizedArray…` type names** produced
by the `sanity-plugin-internationalized-array` plugin. You write the short name in a schema; the
field factory rewrites it to the long one.

`createi18nFieldTypes(types)` builds the alias map `i18n<Type>` → `internationalizedArray<Type>`
(capitalizing the first letter). Core ships six (`i18nFieldTypes`):

| write in schema | becomes |
|---|---|
| `i18nString` | `internationalizedArrayString` |
| `i18nText` | `internationalizedArrayText` |
| `i18nUrl` | `internationalizedArrayUrl` |
| `i18nSlug` | `internationalizedArraySlug` |
| `i18nCropImage` | `internationalizedArrayCropImage` |
| `i18nBaseImage` | `internationalizedArrayBaseImage` |

The field factory (`src/utils/fields.ts`) does the rewrite via `type: ctx.i18nFieldTypes[type] || type`,
so `f('title', 'i18nString')` emits an `internationalizedArrayString` field. Two sources feed this:
- `internationalizedArray({ fieldTypes: config.localization.localizedFieldTypes, languages: fieldLanguages })`
  in `src/index.ts` — the plugin *creates* an `internationalizedArray<Type>` type for each entry.
- `createi18nFieldTypes(localizedFieldTypes)` → `ctx.i18nFieldTypes` — the alias map, so each entry
  also gets its `i18n<Type>` shortcut.

Note `cropImage` / `baseImage` are **custom object schemas** (`src/schemas/objects/`) passed as plain
type-name strings — i.e. any registered object type can be internationalized this way, not just
primitives.

### Adding your own localized type (consumer)
To make a new field type localized (so editors get one value per field language):

1. **Register the type as a schema** if it's a custom object — via `config.objects` (primitives like
   `string`/`url` need no registration). Core's `cropImage`/`baseImage` are the model.
2. **Add its type name to `config.i18n.localizedFieldTypes`** (a string array). `mapConfig` appends
   it to the base six: `localizedFieldTypes = [...i18nFieldTypes, ...config.i18n.localizedFieldTypes]`.
3. Result: the plugin generates `internationalizedArray<YourType>`, and the alias
   `i18n<YourType>` is auto-registered — so schema authors write `f('field', 'i18n<YourType>')`.

```ts
// customer ItsshopsConfig
objects: [myColorObject],                 // defines object type `color`
i18n: { localizedFieldTypes: ['color'] }, // → internationalizedArrayColor + i18nColor alias
// then in a schema build(): f('accent', 'i18nColor')
```

⚠️ Caveat: the field factory only auto-enables the **AI translate** action for `i18nString` /
`i18nText`. Custom localized types are per-locale editable but won't get the AI "translate" button
unless you add `options.aiAssist.translateAction` yourself.

### AI translate
For `i18nString` / `i18nText` the factory sets `options.aiAssist.translateAction: true`, which
surfaces the AI "translate" button. It's powered by `@sanity/assist` (configured in `src/index.ts`
for the enabled doc types × `fieldLanguages`). That's the auto-translate editors see — it fills the
other locales of an internationalized-array field from the default-locale value.

### Reading values back (`src/localization/localizers.ts`)
`createI18nHelpers(locale, baseLocale)` → `ctx.localizer`:
- `.value(arr)` — reads an internationalized-array value with fallback: requested locale → base
  locale → first non-empty.
- `.dictValue(obj)` — same idea for a locale-keyed object.
Used in structure previews / titles to show the right-language label. (`ctx.format`, from
`src/localization/formatters.ts`, does locale-aware number/date/currency formatting.)

## UI languages vs field languages (`src/config/localization.ts`)
`getLanguages({ ui, fields, defaultLocale })` resolves two **separate** sets from
`src/config/constants/languages.ts` (`studioUILanguages`, `fieldUILanguages`):
- **UI languages** → one studio **workspace per language** (`createItsshopsWorkspaces` maps over
  these), basePath `/<locale>`.
- **field languages** → the locales available on internationalized-array fields.
Both force `defaultLocale` to be present and first; a warning logs if a UI locale is missing from
field languages.

## Studio chrome locale (`src/localization/sanityTranslation.ts`)
- `getTranslationPackage(locale)` loads `@sanity/locale-de-de` for `de` (English is built-in).
- `getStructureOverrideBundles(languages)` defines `studio`-namespace overrides (e.g. German
  release-chip strings). Both wired in `src/index.ts` (`plugins` + `i18n.bundles`).

## Consumer overrides (`ItsshopsConfig.i18n`)
`mapConfig` passes these into `createTranslator`:
- `i18n.fieldTranslationOverrides` → `schema` ns (field labels)
- `i18n.structureTranslationOverrides` → `structure` ns
- `i18n.translationOverrides` → `components` ns
- `i18n.localizedFieldTypes` → extra i18n field types; `i18n.{ui,fields,defaultLocale}` → languages.

⚠️ **Known bug** (`createTranslator.ts`): the `components` resources are merged with
`overrides.structure` (not `overrides.components`) for both locales — so `translationOverrides`
(component strings) is currently not applied, and `structureTranslationOverrides` leaks into the
components namespace. Verify before relying on component-string overrides.
