import { ITSSchemaDefinition } from '../../types';

export const internalLink: ITSSchemaDefinition = {
  name: 'internalLink',
  type: 'object',
  build: (ctx) => {
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
          title: 'reference._type',
          subtitle: 'reference.title'
        },
        prepare: ({ title, subtitle }: any) => {
          return {
            title: title ? ctx.t.default(`${title}.title`) : ctx.t.default('title'),
            subtitle: ctx.localizer.value(subtitle),
          };
        },
      },
    }
  }
}
