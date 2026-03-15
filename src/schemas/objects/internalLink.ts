import { ITSSchemaDefinition } from '../../types'

export const internalLink: ITSSchemaDefinition = {
  name: 'internalLink',
  type: 'object',
  build: (ctx) => ({
    fields: ctx.builders.internalLinkFields({ includeTitle: true, includeDisplayType: true }),
  }),
}
