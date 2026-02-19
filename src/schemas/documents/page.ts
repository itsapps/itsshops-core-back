import { ITSDocumentDefinition } from "../../types";
import { DocumentIcon } from '@sanity/icons'

import { Slug } from 'sanity';

export const page: ITSDocumentDefinition = {
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
        // f('slug', 'i18nSlug', { i18n: 'atLeastOne', group: 'page' }),
        f('seo', 'seo', { group: 'seo' }),
        // f('textili', 'portableText'),
        // f('modules', 'array', {
        //   of: [
        //     { type: 'hero' },
        //     // { type: 'portableText' },
        //     { type: 'textBlock' },
        //     // { type: 'textModule' },
        //     // Conditionally add shop modules based on features config
        //     // ...(features.shop.enabled ? [{ type: 'productGridModule' }] : []),
        //     // ...(features.blog ? [{ type: 'latestPostsModule' }] : []),
        //   ],
        //   // Sanity UI hint to make it look better
        //   // options: { layout: 'grid' },
        //   group: 'content',
        // }),
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
