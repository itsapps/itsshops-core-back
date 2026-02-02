import { SchemaIcon } from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";

export const category: ITSSchemaDefinition = {
  name: 'category',
  type: 'document',
  icon: SchemaIcon,
  feature: 'shop',
  disallowedActions: ['delete' ],
  build: (ctx) => {
    const { f, config: { apiVersion } } = ctx;
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('description', 'i18nString'),
        f('level', 'number', { hidden: true }),
        f('sortOrder', 'number', {
          initialValue: 0,
          validation: (rule) => rule.required().positive(),
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
        f('image', 'i18nImage'),
        f('seo', 'seo'),
      ],
      preview:  {
        select: {
          title: 'title',
          subtitle: 'parent.title',
          media: 'image',
        },
        prepare({ title, subtitle, media }: any) {
          const sub = ctx.localizer.value(subtitle)
          const image = ctx.localizer.value<any>(media)
          return {
            title: ctx.localizer.value(title),
            subtitle: sub ? `– ${sub}` : ``,
            media: image?.asset,
          }
        }
      },
    }
  },
};
