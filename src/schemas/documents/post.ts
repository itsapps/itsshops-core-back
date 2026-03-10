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
      fields: [f('title', 'i18nString', { i18n: 'atLeastOne' })],
      preview: {
        select: {
          title: 'title',
          // image: 'image.image',
          // kind: 'kind',
        },
        prepare({ title }) {
          return {
            title: ctx.localizer.value(title),
            media: NoteIcon,
          }
        },
      },
    }
  },
  // preview: (ctx: ITSContext) => {
  //   return {
  //     select: {
  //       title: 'title',
  //       subtitle: 'parent.title',
  //       media: 'image',
  //     },
  //     prepare(s: any) {
  //       const { title, subtitle, media } = s
  //       const sub = ctx.getLocalizedValue(subtitle)
  //       return {
  //         title: ctx.getLocalizedValue(title),
  //         subtitle: sub ? `– ${sub}` : ``,
  //         media: media,
  //       }
  //     },
  //   }
  // }
}
