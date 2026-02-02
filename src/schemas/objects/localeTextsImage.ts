import { ITSSchemaDefinition } from '../../types';

export const localeTextsImage: ITSSchemaDefinition = {
  name: 'localeTextsImage',
  type: 'image',
  build: (ctx) => {
    return {
      options: { hotspot: true },
      fields: [
        ctx.f('title', 'i18nString'),
        ctx.f('alt', 'i18nString'),
      ],
      validation: (Rule) => Rule.required().assetRequired(),
      // validation: (rule) =>
      //   rule.custom((field) => {
      //     const image = field as { asset?: unknown };
      //     return image?.asset
      //       ? true
      //       : ctx.t.default('localeImage.validation.assetRequired')
      //       // : {
      //       //     message: ctx.t.default('localeImage.validation.assetRequired'),
      //       //     // path: []
      //       // };
      //   }),
      preview: {
        select: {
          title: 'title',
          alt: 'alt',
          asset: 'asset',
        },
        prepare: ({ title, alt, asset }) => {
          return {
            title: ctx.localizer.value(title),
            subtitle: ctx.localizer.value(alt),
            media: asset,
          };
        }
      }
    }
  }
}
