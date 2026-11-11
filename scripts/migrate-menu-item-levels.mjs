#!/usr/bin/env node
// One-time migration for the per-level menu item types: menu items nested in
// a submenu were stored as `menuItem`; each level now has its own type — `menuItem` (top level),
// `menuItem1`, `menuItem2`, … This sets `_type` by nesting level in every menu document
// (drafts included). Content stays as it is. Idempotent.
//
//   SANITY_WRITE_TOKEN=<editor token> node node_modules/@itsapps/itsshops-core-back/scripts/migrate-menu-item-levels.mjs \
//     --project <projectId> --dataset <dataset> [--dry]
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]?.startsWith('--') ? true : all[i + 1] ?? true]] : acc), []),
)
const token = process.env.SANITY_WRITE_TOKEN
if (!args.project || !args.dataset || !token) {
  console.error('usage: SANITY_WRITE_TOKEN=… migrate-menu-item-levels.mjs --project <id> --dataset <name> [--dry]')
  process.exit(1)
}
const api = `https://${args.project}.api.sanity.io/v2025-02-19/data`
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

const typeAt = (level) => (level === 0 ? 'menuItem' : `menuItem${level}`)

// returns the relabelled items and how many _type values changed
const relabel = (items, level) => {
  let changed = 0
  const out = (items ?? []).map((item) => {
    const next = { ...item, _type: typeAt(level) }
    if (item._type !== next._type) changed++
    if (Array.isArray(item.children)) {
      const sub = relabel(item.children, level + 1)
      next.children = sub.items
      changed += sub.changed
    }
    return next
  })
  return { items: out, changed }
}

const query = encodeURIComponent('*[_type == "menu"]{ _id, _rev, items }')
const res = await fetch(`${api}/query/${args.dataset}?query=${query}&perspective=raw`, { headers })
if (!res.ok) throw new Error(`query: ${res.status} ${await res.text()}`)
const menus = (await res.json()).result

const mutations = []
for (const menu of menus) {
  const { items, changed } = relabel(menu.items, 0)
  console.log(`${menu._id}: ${changed} item type(s) to change`)
  if (changed) mutations.push({ patch: { id: menu._id, ifRevisionID: menu._rev, set: { items } } })
}
if (!mutations.length || args.dry) {
  console.log(args.dry ? 'dry run — nothing written' : 'nothing to migrate')
  process.exit(0)
}
const write = await fetch(`${api}/mutate/${args.dataset}`, { method: 'POST', headers, body: JSON.stringify({ mutations }) })
if (!write.ok) throw new Error(`mutate: ${write.status} ${await write.text()}`)
console.log(`migrated ${mutations.length} menu document(s)`)
