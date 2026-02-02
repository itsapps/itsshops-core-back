// packages/core-back/src/schemas/objects/multiColumns.ts
import { CoreObject } from '../../types';

export const multiColumns: CoreObject = {
  name: 'multiColumns',
  build: (ctx) => {
    const { f } = ctx;
    return {
      type: 'object',
      fields: [
        f('headline', 'i18nString'),
        f('backgroundImage', 'i18nImage'),
        f('columns', 'array', {
          of: [
            // { type: 'i18nBlock' }, 
            { type: 'youtube' }, 
            { type: 'seo' }, 
            // { type: 'youtube' },
          ],
        })
      ],
      preview: {
        select: {
          headline: 'headline',
          columns: 'columns'
        },
        prepare({ headline, columns }: any) {
          const title = ctx.localizer.value(headline) || 
            `${(columns || []).length} ${ctx.t.default('multiColumns.preview.columns', 'Columns')}`;
          
          return {
            title,
            subtitle: ctx.t.default('multiColumns.schemaTitle', 'Multi Columns'),
          };
        }
      }
    };
  }
};