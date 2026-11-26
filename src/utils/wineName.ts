/**
 * Wine-name helpers for the Product Manager. VinoFact has no link between the vintages of a
 * wine (every vintage is its own wine with a free-text name + year), so the tool groups them by
 * a normalized name. Pure functions, shared by the wine grid and the duplicate check.
 */

/** "Ried Steinberg 2023" → "Ried Steinberg" (a trailing 4-digit year). */
export function stripYear(title: string): string {
  return title.replace(/\s*\d{4}\s*$/, '').trim()
}

/** Lower-case, accents folded ("Grüner" → "gruner"), whitespace collapsed. */
export function normalizeTitle(title: string): string {
  return title.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

/** `normalizeTitle(stripYear(title))` — the key the grid groups the vintages of a wine by. */
export function normalizeWineName(title: string): string {
  return normalizeTitle(stripYear(title))
}

type WineLike = { id: string; title: string; year: string | null }

/** Newest vintage first; wines without a year last; then by title. */
export function compareVintageDesc(a: WineLike, b: WineLike): number {
  const ya = Number(a.year) || 0
  const yb = Number(b.year) || 0
  if (ya !== yb) return yb - ya
  return a.title.localeCompare(b.title)
}

/** Every wine whose normalized name matches one of the seeds' (the seeds included). */
export function matchingWines<W extends WineLike>(wines: W[], seedIds: string[]): W[] {
  const seeds = wines.filter((w) => seedIds.includes(w.id))
  const names = new Set(seeds.map((w) => normalizeWineName(w.title)))
  return wines.filter((w) => seedIds.includes(w.id) || names.has(normalizeWineName(w.title)))
}

/**
 * The grid's rows: the seeds' matches plus the wines the editor added, minus the ones they
 * removed, newest vintage first.
 */
export function gridWines<W extends WineLike>(
  wines: W[],
  seedIds: string[],
  addedIds: string[],
  removedIds: string[],
): W[] {
  const matched = matchingWines(wines, seedIds)
  const ids = new Set(matched.map((w) => w.id))
  const added = wines.filter((w) => addedIds.includes(w.id) && !ids.has(w.id))
  return [...matched, ...added].filter((w) => !removedIds.includes(w.id)).sort(compareVintageDesc)
}

/**
 * Which grid rows are shown while "show older" is collapsed: the newest `limit` rows plus every
 * row in `keep` (rows with existing or ticked cells, rows the editor added). Keeps the order.
 */
export function visibleGridWines<W extends WineLike>(
  rows: W[],
  keep: Set<string>,
  limit: number,
): W[] {
  return rows.filter((w, i) => i < limit || keep.has(w.id))
}

/**
 * The grid's columns (ml): the volumes in use, 750 and the ones the editor added, unique and
 * ascending.
 */
export function gridVolumes(used: number[], added: number[]): number[] {
  return [...new Set([...used, 750, ...added])]
    .filter((v) => Number.isFinite(v) && v > 0)
    .sort((a, b) => a - b)
}
