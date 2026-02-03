import { ITSSchemaDefinition, FieldContext } from '../../types';

const documentTypes = ['product', 'productVariant', 'page', 'post', 'category', 'blog'];

export const getInternalLinkFields = (ctx: FieldContext, options: { 
  includeTitle?: boolean, 
  includeDisplayType?: boolean,
  to?: string[] 
} = {}) => {
  const { f } = ctx;
  const t = ctx.t.default;

  return [
    // Conditionally include fields
    ...(options.includeTitle ? [f('title', 'i18nString')] : []),
    
    f('reference', 'reference', {
      to: (options.to || documentTypes).map(type => ({ type })),
      options: {
        // filter: options.to?.includes('product') ? `...your product filter...` : ''
        filter: `
          (!defined(active) && _type != "product") ||
          (active == true && _type == "productVariant") ||
          ((!defined(variants) || count(variants) == 0) && _type == "product")
        `
      }
    }),

    ...(options.includeDisplayType ? [
      f('displayType', 'string', {
        options: {
          list: [
            { title: t('displayType.options.link'), value: 'link' },
            { title: t('displayType.options.button'), value: 'button' },
          ],
        }
      })
    ] : []),
  ];
};

export const internalLink: ITSSchemaDefinition = {
  name: 'internalLink',
  type: 'object',
  build: (ctx) => ({
    fields: getInternalLinkFields(ctx, { includeTitle: true, includeDisplayType: true })
  })
};