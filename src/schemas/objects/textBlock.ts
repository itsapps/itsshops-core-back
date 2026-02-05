import { ITSSchemaDefinition } from '../../types';
import { Article } from 'phosphor-react'

export const textBlock: ITSSchemaDefinition = {
  name: 'textBlock',
  type: 'object',
  icon: Article,
  build: (ctx) => {
    return {
      fields: [
        // ctx.f('pt', 'portableText'),
        ctx.f('content', 'array', {
          // We use the builder to fill the 'of' property
          input: ctx.builders.portableText({ allowLinks: true })
        })
      ],
      preview: {
        select: { content: 'content' },
        prepare: ({ content }) => ({
          title: 'Text Block',
          subtitle: ctx.localizer.value(content?.[0]?.children?.[0]?.text) || 'Empty',
          media: Article,
        })
      }
    };
  }
};