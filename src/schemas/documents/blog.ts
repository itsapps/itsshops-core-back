import { ITSDocumentDefinition } from "../../types";
import { Note } from 'phosphor-react'

export const blog: ITSDocumentDefinition = {
  name: 'blog',
  type: 'document',
  icon: Note,
  feature: 'blog',
  isSingleton: true,
  // validation: (Rule) => Rule.required(),
  build: (ctx) => {
    const { f } = ctx;
    return {
      // validation: (Rule) => Rule.required(),
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne', group: 'blog' }),
        f('description', 'i18nString', { i18n: 'atLeastOne', group: 'blog' }),
        f('seo', 'seo', { group: 'seo' }),
        // f('image', 'baseImage', { validation: (Rule) => Rule.required().assetRequired() }),
        // f('imagearray', 'imageArray'),
        f('postsPerPage', 'number', { group: 'settings', validation: (Rule) => Rule.min(1).max(100), initialValue: 10 }),
      ],
      groups: [
        { name: 'blog', default: true },
        { name: 'seo' },
        { name: 'settings' },
      ],
      preview: {
        select: {
          title: 'title',
          description: 'description',
        },
        prepare: ({title, description}) => {
          return {
            title: ctx.localizer.value(title),
            subtitle: ctx.localizer.value(description),
            // media: PackageIcon,
          }
        }
      }
    }
  }
};
