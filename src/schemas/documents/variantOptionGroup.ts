import { SparklesIcon } from '@sanity/icons'
import { ITSContext, FieldContext, CoreDocument } from "../../types";
import {EditGroupOptions} from '../../components/EditGroupOptions'

export const variantOptionGroup: CoreDocument = {
  name: 'variantOptionGroup',
  icon: SparklesIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  baseFields: (ctx: FieldContext) => {
    const { f } = ctx;
    return [
      f('title', 'i18nString', { i18n: 'atLeastOne' }),
      f('description', 'i18nString'),
      f('sortOrder', 'number', {
        initialValue: 0,
        validation: (rule) => rule.required().positive(),
      }),
      f('options', 'array', {
        of: [{
          type: 'reference',
          to: [{
            type: 'variantOption',
          }],
        }],
        components: {
          input:  EditGroupOptions
        }
      }),
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
