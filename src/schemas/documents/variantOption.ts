import { SparklesIcon } from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";

export const variantOption: ITSSchemaDefinition = {
  name: 'variantOption',
  type: 'document',
  icon: SparklesIcon,
  feature: 'shop',
  disallowedActions: [ 'duplicate' ],
  allowCreate: false,
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('sortOrder', 'number', {
          initialValue: 0,
          validation: (rule) => rule.required().positive(),
        }),
        f('image', 'i18nTextImage'),
      ],
      preview: {
        select: {
          title: 'title',
          media: 'image',
        },
        prepare({ title, media }) {
          const image = ctx.localizer.value<any>(media)
          return {
            title: ctx.localizer.value(title),
            media: image?.asset,
          }
        }
      }
    }
  }
};
