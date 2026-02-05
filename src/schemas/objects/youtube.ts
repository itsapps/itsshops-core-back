import { ITSSchemaDefinition } from '../../types';
import { YoutubeLogo } from 'phosphor-react'

export const youtube: ITSSchemaDefinition = {
  name: 'youtube',
  type: 'object',
  icon: YoutubeLogo,
  build: (ctx) => {
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
          subtitle: 'start'
        },
      }
    };
  }
};