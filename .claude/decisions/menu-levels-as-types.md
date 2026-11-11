# Menu levels are separate item types; `maxDepth` counts levels including the top level

**Status:** Active
**Date:** 2026-11-11

## Context

Menus had one recursive `menuItem` type with a `submenu` choice on every level and a depth
validation on `children`. That rule counted the `children` segments in the path — including a
link's own (hidden, empty) `children` field — so at the default `maxDepth: 1` no submenu with
links validated; jurtschitsch set `maxDepth: 2` to get top-level links + submenus of links.
core-front's `menu.maxDepth`, meanwhile, counted levels *below* the top and fetched one empty
level too many. Editors saw the `submenu` choice where it wasn't allowed and only got an error
after adding a child. Sanity choice lists (`options.list`) are static and `hidden` works per
field, so one shared type cannot drop the `submenu` choice at the last level.

## Decision

- `maxDepth` = number of menu levels, **top level included**, in core-back and core-front alike
  (1 = flat, the default; 2 = top-level links + submenus of links). It matches the existing
  configs (tinhof 1, jurtschitsch 2) and fetches nothing unneeded. `disableSubmenus` is removed
  (redundant).
- core-back generates one item type per level from the `menuItem` definition: `menuItem`,
  `menuItem1`, … (numbered, so any depth needs no new naming). Only levels below the last offer
  `submenu` and `children` (typed as the next level); the depth rule is gone.
- A definition's optional `baseName` makes every level share `menuItem`'s labels,
  `schemaExtensions` key, groups and preview, so a customer extends menu items once.

## Consequences

- A data change for projects with submenus: children stored as `menuItem` must become
  `menuItem1` (drafts included). Only jurtschitsch has submenus, so the one-off script lives
  there (backend `scripts/migrate-menu-item-levels.mjs`), not in core. The frontend reads fields, not `_type`, so it is unaffected.
- A third level appears only by raising `maxDepth` in both repos; the frontend templates must
  render it then.
- Rejected: a `linkType` rule (keeps the visible but invalid choice) and a custom input that
  filters the radio list (more code for the same result).
