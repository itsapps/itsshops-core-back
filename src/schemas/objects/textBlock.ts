import { ArticleIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const textBlock: ITSSchemaDefinition = {
  name: 'textBlock',
  type: 'object',
  icon: ArticleIcon,
  build: (ctx) => {
    return {
      fields: [
        // ctx.f('pt', 'portableText'),
        ctx.f('content', 'array', {
          // We use the builder to fill the 'of' property
          input: ctx.builders.portableText({ allowLinks: true }),
        }),
      ],
      preview: {
        select: { content: 'content' },
        prepare: ({ content }) => ({
          title: 'Text Block',
          subtitle: content?.[0]?.children?.[0]?.text || 'Empty',
          media: ArticleIcon,
        }),
      },
    }
  },
}
