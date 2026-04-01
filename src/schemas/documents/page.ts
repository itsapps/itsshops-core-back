import { Slug } from 'sanity'

import { PageIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const page: ITSDocumentDefinition = {
  name: 'page',
  type: 'document',
  icon: PageIcon,
  build: (ctx) => {
    const { f } = ctx
    return {
      groups: [{ name: 'page', default: true }, { name: 'seo' }, { name: 'content' }],
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne', group: 'page' }),
        f('slug', 'i18nSlug', { group: 'page' }),
        f('seo', 'seo', { group: 'seo' }),
      ],
      preview: {
        select: {
          title: 'title',
          slug: 'slug',
        },
        prepare({ title, slug }) {
          const s = ctx.localizer.value<Slug>(slug)
          return {
            title: ctx.localizer.value(title),
            subtitle: s?.current,
          }
        },
      },
    }
  },
}
