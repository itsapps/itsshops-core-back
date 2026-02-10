import { Package } from 'phosphor-react'
import { ITSDocumentDefinition } from "../../types";


export const taxCategory: ITSDocumentDefinition = {
  name: 'taxCategory',
  type: 'document',
  icon: Package,
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        // f('isDefault', 'boolean', { initialValue: false }),
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('code', 'slug', {
          // options: { source: 'title' },
          // readOnly: ({ document }) => !!document?._createdAt, // Safety lock
          validation: (Rule) => Rule.required()
        }),
      ],
      preview: {
        select: {
          title: 'title',
          code: 'code',
        },
        prepare({ title, code }) {
          return {
            title: ctx.localizer.value(title),
            subtitle: code?.current,
          }
        },
      }
    }
  }
};
