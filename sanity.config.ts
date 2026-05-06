import { defineConfig } from 'sanity'

import { createItsshopsWorkspaces, type ItsshopsConfig } from './src'

// This workspace exists only for local schema dev and `sanity typegen`.
// Customer Studios declare their own feature subsets — this config is
// disconnected from them. `ignoreExtensions: true` forces `allFeatures()`
// (see src/config/mapper.ts) so the generated schema is the full superset,
// regardless of what's set here. To enable a new feature in typegen, add
// it to `allFeatures()` — not here.
const config: ItsshopsConfig = {
  // workspaceIcon: WineIcon,
  settings: {
    isDev: true,
    ignoreExtensions: true,
  },
}

const configs = createItsshopsWorkspaces(config)
export default defineConfig(configs)
