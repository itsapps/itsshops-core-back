import { defineConfig } from 'sanity'

import { createItsshopsWorkspaces, type ItsshopsConfig } from './src'

// This workspace exists only for local schema dev and `sanity typegen`.
// Customer Studios declare their own feature subsets — this config is
// disconnected from them. `ignoreExtensions: true` forces `allFeatures()`
// (see src/config/mapper.ts) so the generated schema is the full superset,
// regardless of what's set here. To enable a new feature in typegen, add
// it to `allFeatures()` — not here.
const config: ItsshopsConfig = {
  workspaceName: process.env.SANITY_STUDIO_WORKSPACE_NAME!,
  // workspaceIcon: WineIcon,
  projectId: process.env.SANITY_STUDIO_PROJECT!,
  dataset: process.env.SANITY_STUDIO_DATASET!,
  settings: {
    isDev: true,
    ignoreExtensions: true,
  },
  integrations: {
    netlify: {
      accessToken: process.env.SANITY_STUDIO_NETLIFY_ACCESS_TOKEN!,
      siteId: process.env.SANITY_STUDIO_NETLIFY_SITE_ID!,
      projectName: process.env.SANITY_STUDIO_NETLIFY_PROJECT_NAME!,
      endpoint: process.env.SANITY_STUDIO_NETLIFY_FUNCTIONS_ENDPOINT!,
      secret: process.env.SANITY_STUDIO_NETLIFY_FUNCTIONS_SECRET!,
    },
  },
}

const configs = createItsshopsWorkspaces(config)
export default defineConfig(configs)
