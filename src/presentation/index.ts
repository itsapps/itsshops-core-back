import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from 'sanity/presentation'

import type { ITSContext } from '../types'

const getLocations = (ctx: ITSContext) => {
  const message = ctx.structureT.default('liveEditor')

  const previewDocumentTypes = ['page', 'post']
    .map((type) => (ctx.featureRegistry.isDocEnabled(type) ? type : null))
    .filter(Boolean)
  const locations = Object.fromEntries(
    previewDocumentTypes.map((key) => [
      key,
      defineLocations({
        select: { id: '_id', i18nTitle: 'title' },
        resolve: (doc) => {
          return {
            locations: [
              {
                title: ctx.localizer.value(doc?.i18nTitle) || 'Untitled Document',
                href: `/api/preview/${ctx.locale}/${key}/${doc?.id}`,
              },
            ],
            message,
            tone: 'positive',
          }
        },
      }),
    ]),
  )
  return locations
}

// Configures documents presentation tool should open by default when navigating to an URL
const mainDocuments = defineDocuments([
  {
    route: 'api/preview/:locale',
    // core-front renders the home page for this route (settings.homePage)
    filter: `_type == "page" && _id == *[_type == "settings"][0].homePage._ref`,
    // filter: `_type == "page"`,
    // resolve(ctx) {
    //   const {params} = ctx
    //   return {
    //     filter: `_type == "page" && slug.current == $slug}`,
    //     params: {
    //       type: params.type,
    //       slug: params.slug.replaceAll('_', '-'),
    //     },
    //   }
    // },
  },
  {
    route: 'api/preview/:locale/page/:id',
    filter: `_type == "page" && _id == $id`,
  },
])

export const createPresentations = (ctx: ITSContext): PresentationPluginOptions => {
  return {
    resolve: { locations: getLocations(ctx), mainDocuments },
    previewUrl: {
      initial: `${ctx.config.integrations.netlify.endpoint}/api/preview/${ctx.locale}`,
      // Presentation creates a short-lived secret and opens `enable` (resolved against `initial`'s
      // origin); core-front's preview-enable validates it and stores a preview session token in
      // the iframe's sessionStorage. Not under /api/preview/ (clashes with /api/preview/:locale).
      // No share access: no link-based draft preview without a Studio login.
      previewMode: { enable: '/api/preview-enable', shareAccess: false },
    },
  }
}
