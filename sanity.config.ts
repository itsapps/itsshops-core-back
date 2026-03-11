import { defineConfig } from 'sanity'

import { createItsshopsWorkspaces, type ItsshopsConfig } from './src'

const config: ItsshopsConfig = {
  workspaceName: process.env.SANITY_STUDIO_WORKSPACE_NAME!,
  // workspaceIcon: WineIcon,
  projectId: process.env.SANITY_STUDIO_PROJECT!,
  dataset: process.env.SANITY_STUDIO_DATASET!,
  settings: {
    isDev: true,
    ignoreExtensions: true,
  },
  features: {
    shop: {
      enabled: true,
      manufacturer: true,
      stock: true,
      category: true,
      vinofact: {
        enabled: true,
        integration: {
          endpoint: process.env.SANITY_STUDIO_VINOFACT_API_URL!,
          accessToken: process.env.SANITY_STUDIO_VINOFACT_API_TOKEN!,
          profileSlug: process.env.SANITY_STUDIO_VINOFACT_PROFILE_SLUG!,
        },
      },
    },
    blog: true,
    users: true,
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
