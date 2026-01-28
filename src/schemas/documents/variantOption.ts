import { SparklesIcon } from '@sanity/icons'
import { ITSContext, FieldContext, CoreDocument } from "../../types";

export const variantOption: CoreDocument = {
  name: 'variantOption',
  icon: SparklesIcon,
  feature: 'shop',
  disallowedActions: [ 'duplicate' ],
  allowCreate: false,
  baseFields: (ctx: FieldContext) => {
    const { f } = ctx;
    return [
      f('title', 'i18nString', { i18n: 'atLeastOne' }),
      f('sortOrder', 'number', {
        initialValue: 0,
        validation: (rule) => rule.required().positive(),
      }),
      f('image', 'localeImage'),
    ]
  },
  preview: (ctx: ITSContext) => {
    return {
      select: {
        title: 'title',
      },
      prepare(s: any) {
        const { title } = s
        return {
          title: ctx.helpers.localizer.value(title),
        }
      },
    }
  }
};
