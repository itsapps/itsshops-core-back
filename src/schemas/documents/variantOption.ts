import { SparklesIcon } from '@sanity/icons'
import { ITSDocumentDefinition } from "../../types";

export const variantOption: ITSDocumentDefinition = {
  name: 'variantOption',
  type: 'document',
  icon: SparklesIcon,
  feature: 'shop',
  disallowedActions: [ 'duplicate' ],
  allowCreate: false,
  hideInStructure: true,
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('sortOrder', 'number', {
          initialValue: 0,
          validation: (rule) => rule.required().positive(),
        }),
        // f('image', 'localeImage'),
        f('images', 'array', {
          of: [{ type: 'localeImage' }],
          // validation: (rule) => rule.required(),
        }),
      ],
      preview: {
        select: {
          title: 'title',
          // media: 'image',
        },
        prepare({ title }) {
          // const image = ctx.localizer.value<any>(media)
          return {
            title: ctx.localizer.value(title),
            media: SparklesIcon,
            // media: image?.asset,
          }
        }
      }
    }
  }
};
