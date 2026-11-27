/**
 * Pure helpers of the Product Manager. The tool writes published documents directly (no schema
 * validation runs), so it checks typed numbers itself.
 */

/** A typed whole number ≥ `min` ("3"; not "2,5", "-1", "abc"), else `undefined`. */
export function parseWholeNumber(input: string, min: number): number | undefined {
  const trimmed = input.trim()
  if (!/^\d+$/.test(trimmed)) return undefined
  const value = Number(trimmed)
  return value >= min ? value : undefined
}

/**
 * The stock field: empty = unset (unlimited — core-front skips the stock check for a missing
 * value), else a whole number ≥ 0. `valid: false` for anything else.
 */
export function parseStock(input: string): { valid: boolean; value: number | undefined } {
  if (!input.trim()) return { valid: true, value: undefined }
  const value = parseWholeNumber(input, 0)
  return { valid: value !== undefined, value }
}

export type CategoryDoc = { _id: string; title: string; parentId?: string | null }
export type CategoryNode = { _id: string; title: string; depth: number }

/**
 * Categories in display order with their depth: with `nested`, children follow their parent
 * depth-first (any depth); a parent that isn't in the list puts the category on the top level.
 * Without `nested` the list stays flat. Keeps the input order among siblings; guards cycles.
 */
export function categoryTree(categories: CategoryDoc[], nested: boolean): CategoryNode[] {
  if (!nested) return categories.map((c) => ({ _id: c._id, title: c.title, depth: 0 }))
  const ids = new Set(categories.map((c) => c._id))
  const children = new Map<string, CategoryDoc[]>()
  const roots: CategoryDoc[] = []
  for (const c of categories) {
    if (c.parentId && ids.has(c.parentId) && c.parentId !== c._id) {
      children.set(c.parentId, [...(children.get(c.parentId) ?? []), c])
    } else {
      roots.push(c)
    }
  }
  const out: CategoryNode[] = []
  const seen = new Set<string>()
  const walk = (c: CategoryDoc, depth: number) => {
    if (seen.has(c._id)) return
    seen.add(c._id)
    out.push({ _id: c._id, title: c.title, depth })
    for (const child of children.get(c._id) ?? []) walk(child, depth + 1)
  }
  roots.forEach((c) => walk(c, 0))
  // A cycle (a → b → a) has no root: show what is left on the top level
  categories.forEach((c) => walk(c, 0))
  return out
}
