# Upload-restricted (localized) files are named file types registered in core's builder

**Status:** Active
**Date:** 2026-10-04

## Context

A customer (Jurtschitsch) needed a per-locale PDF field. Plain `file` in `localizedFieldTypes`
(→ `i18nFile`) works, but `options.accept` on the field only lands on the outer
internationalized array, never on the inner file — so uploads can't be restricted. The inner type
has to be a **named** file type with its own `options.accept`. Before this, `createDefinition`
(`src/schemas/index.ts`) only built `document` / `object` / `array` / `image` and threw
`Unknown schema type` for anything else, so `config.objects` couldn't register one.

Alternatives considered and rejected:
- **Customer-side Sanity plugin** registering `pdfFile` via `definePlugin({ schema: { types } })` and
  appending it to each workspace — works without core changes, but creates a second, undocumented
  type-registration path that bypasses the builder and translator.
- **Accept full field definitions in `localizedFieldTypes`** (the internationalized-array plugin
  supports it) — more flexible, but a second way to declare localized types; not needed yet.

## Decision

Add `ITSFileDefinition` (`type: 'file'`) to `ITSSchemaDefinition`; `createDefinition` builds it in the
same branch as `image` (both are asset types: optional extra fields + preview). Customers register
one named type per restriction (e.g. `pdfFile` with `accept: 'application/pdf'`) in `objects` and
list it in `i18n.localizedFieldTypes` → `i18n<Name>`.

## Consequences

- Any customer can add file types with different `accept` values without further core changes;
  they work localized or not.
- `accept` is fixed per type, not per field — a new restriction means a new named type.
- `accept` only filters the studio picker; API uploads aren't validated.
- Data stored as `internationalizedArrayFile` isn't compatible with `internationalizedArray<Name>`;
  switching an existing field needs a migration.
- How-to: [localization.md](../architecture/localization.md) ("Localized files with an upload
  restriction").
