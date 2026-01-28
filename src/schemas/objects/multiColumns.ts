// packages/core-back/src/schemas/objects/multiColumns.ts
import { CoreObject, FieldContext } from '../../types';

export const multiColumns: CoreObject = {
  name: 'multiColumns',
  type: 'object',
  build: (ctx: FieldContext) => {
    const { f } = ctx;
    return {
      fields: [
        f('headline', 'i18nString'),
        f('backgroundImage', 'i18nImage'),
        f('columns', 'array', {
          of: [
            // Using the i18n version of your complex portable text
            { type: 'localeComplexPortable' }, 
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
          const title = ctx.helpers.localizer.value(headline) || 
            `${(columns || []).length} ${ctx.helpers.t.default('multiColumns.preview.columns', 'Columns')}`;
          
          return {
            title,
            subtitle: ctx.helpers.t.default('multiColumns.schemaTitle', 'Multi Columns'),
          };
        }
      }
    };
  }
};