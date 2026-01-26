// packages/core-back/src/schemas/objects/multiColumns.ts
import { CoreObject, FieldContext } from '../../types';

export const youtube: CoreObject = {
  name: 'youtube',
  type: 'object',
  build: (ctx: FieldContext) => {
    const { f } = ctx;
    return {
      fields: [
        f('url', 'string', { validation: (Rule) => Rule.required() }),
        f('showControls', 'boolean', { initialValue: false }),
        f('autoload', 'boolean', { initialValue: false }),
        f('autopause', 'boolean', { initialValue: false }),
        f('start', 'string'),
      ],
      preview: {
        select: {
          title: 'url',
          columns: 'columns'
        },
      }
    };
  }
};