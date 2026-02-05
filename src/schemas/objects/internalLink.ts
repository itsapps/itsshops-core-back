import { ITSSchemaDefinition } from '../../types';

export const internalLink: ITSSchemaDefinition = {
  name: 'internalLink',
  type: 'object',
  build: (ctx) => ({
    fields: ctx.builders.internalLink({ includeTitle: true, includeDisplayType: true })
  })
};