import { CoreObject, FieldContext } from '../../types';

export const internalLink: CoreObject = {
  name: 'internalLink',
  type: 'object',
  build: (ctx: FieldContext) => {
    const { f } = ctx;
    const t = ctx.t.default
    return {
      fields: [
        f('reference', 'reference', {
          to: [
            { type: 'product', },
            { type: 'productVariant' },
            { type: 'page' },
            { type: 'post' },
            { type: 'category' },
            { type: 'blog' },
          ],
          options: {
            filter: `
              (!defined(active) && _type != "product") ||
              (active == true && _type == "productVariant") ||
              ((!defined(variants) || count(variants) == 0) && _type == "product")
            `
          }
        }),
        f('displayType', 'string', {
          options: {
            list: [
              { title: t('displayType.options.link'), value: 'link' },
              { title: t('displayType.options.button'), value: 'button' },
            ],
          }
        }),
      ],
      preview: {
        select: {
          image: 'image',
          title: 'title',
          alt: 'alt',
        },
        prepare: ({ image, title, alt }: any) => {
          return {
            // We use our new array-based helper here
            title: ctx.localizer.value(title) || 'No title',
            subtitle: ctx.localizer.value(alt) || 'No alt',
            media: image?.asset,
            // media: ctx.getLocalizedValue(image)?.asset,
          };
        },
      },
    }
  }
}
