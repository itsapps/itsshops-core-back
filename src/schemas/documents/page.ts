import { DocumentIcon } from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";

export const page: ITSSchemaDefinition = {
  name: 'page',
  type: 'document',
  icon: DocumentIcon,
  build: (ctx) => {
    const { f } = ctx;
    return {
      groups: [
        { name: 'page', default: true },
        { name: 'seo' },
        { name: 'content' },
      ],
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne', group: 'page' }),
        f('slug', 'i18nSlug', { i18n: 'atLeastOne', group: 'page' }),
        // TODO: modules f('modules', 'array', { i18n: 'atLeastOne', group: 'page' }),
        f('seo', 'seo', { tKey: 'seo', group: 'seo' }),
      ],
      preview: {
        select: {
          title: 'title',
          slug: 'slug',
        },
        prepare({ title, slug }) {
          const s = ctx.localizer.value<any>(slug)
          return {
            title: ctx.localizer.value(title),
            subtitle: s?.current,
          }
        },
      }
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
};
