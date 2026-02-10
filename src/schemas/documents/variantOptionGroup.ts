import { SparklesIcon } from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";
import { EditGroupOptions } from '../../components/EditGroupOptions'

export const variantOptionGroup: ITSSchemaDefinition = {
  name: 'variantOptionGroup',
  type: 'document',
  icon: SparklesIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        // f('description', 'i18nString'),
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
      ],
      preview: {
        select: {
          title: 'title',
          options: 'options'
        },
        prepare( { title, options } ) {
          const count = options?.length || 0
          return {
            title: ctx.localizer.value(title),
            subtitle: ctx.t.default('variantOptionGroup.preview.options', 'options', { count }),
            media: SparklesIcon
          }
        },
      }
    }
  },
};
