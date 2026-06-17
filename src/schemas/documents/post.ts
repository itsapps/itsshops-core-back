import { Slug } from 'sanity'

import { NoteIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const post: ITSDocumentDefinition = {
  name: 'post',
  type: 'document',
  icon: NoteIcon,
  feature: 'blog',
  build: (ctx) => {
    const { f } = ctx
    return {
      groups: [{ name: 'post', default: true }, { name: 'seo' }, { name: 'content' }],
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne', group: 'post' }),
        f('slug', 'i18nSlug', { group: 'post' }),
        f('publishedAt', 'datetime', {
          options: ctx.format.dateFormat('datetime'),
        }),
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
