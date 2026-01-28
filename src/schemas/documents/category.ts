import { SchemaIcon } from '@sanity/icons'
import { ITSContext, FieldContext, CoreDocument } from "../../types";

export const category: CoreDocument = {
  name: 'category',
  icon: SchemaIcon,
  feature: 'shop',
  disallowedActions: ['delete' ],
  baseFields: (ctx: FieldContext) => {
    const { f, config: { apiVersion } } = ctx;
    return [
      f('title', 'i18nString', { i18n: 'atLeastOne' }),
      // f('description', 'i18nString', { i18n: 'atLeastOne' }),
      f('level', 'number', { hidden: true }),
      f('sortOrder', 'number', {
        initialValue: 0,
        validation: (rule) => rule.required()
      }),
      f('parent', 'reference', {
        to: [{ type: 'category' }],
        options: { disableNew: true },
        validation: (rule) =>
          rule.custom((parent, context) => {
            // parent = the selected parent ref
            // context.document = the category being edited

            // If parent is empty → this is a main category → always allowed
            if (!parent) return true

            // Count how many categories have no parent
            return context
              .getClient({ apiVersion })
              .fetch('count(*[_type == "category" && !defined(parent) && _id != $id])', {
                id: context.document?._id,
              })
              .then((mainCount) => {
                if (mainCount === 0) {
                  return 'At least one category must remain a main category (without a parent).'
                }
                return true
              })
          }),
      }),
      f('image', 'localeImage'),
      f('seo', 'seo'),
    ]
  },
  preview: (ctx: ITSContext) => {
    return {
      select: {
        title: 'title',
        subtitle: 'parent.title',
        media: 'image',
      },
      prepare(s: any) {
        const { title, subtitle, media } = s
        const sub = ctx.localizer.value(subtitle)
        return {
          title: ctx.localizer.value(title),
          subtitle: sub ? `– ${sub}` : ``,
          media: media,
        }
      },
    }
  }
};
