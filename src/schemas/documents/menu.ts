import { ITSDocumentDefinition } from "../../types";
import { OlistIcon } from '@sanity/icons'


export const menu: ITSDocumentDefinition = {
  name: 'menu',
  type: 'document',
  icon: OlistIcon,
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        ctx.f('items', 'array', {
          of: [{ type: 'menuItem' }],
          validation: (rule) => rule.required()
        })
        // f('items', 'array', { of: [{ type: 'navPage' }, { type: 'navLink' }] }),
      ],
      preview: {
        select: {
          title: 'title',
          // items: 'items',
        },
        prepare({ title }) {

          return {
            title: ctx.localizer.value(title) || 'No title',
            // subtitle: sub ? `– ${sub}` : ``,
            // media: media,
          }
        }
      }
    }
  }
};
