// packages/core-back/src/schemas/objects/complexPortableText.ts
import { CoreObject, FieldContext } from '../../types';
import { TextAlignLeft, TextAlignRight, TextAlignCenter, Code, Link } from 'phosphor-react';

export const complexPortableText: CoreObject = {
  name: 'complexPortableText',
  type: 'block', // Blocks are wrapped in objects or used in arrays
  build: (ctx: FieldContext) => ({
    type: 'block',
    marks: {
      decorators: [
        { title: ctx.t('complexPortableText.decorators.strong'), value: 'strong' },
        { title: ctx.t('complexPortableText.decorators.emphasis'), value: 'em' },
        { title: ctx.t('complexPortableText.decorators.left'), value: 'left', icon: TextAlignLeft },
        { title: ctx.t('complexPortableText.decorators.center'), value: 'center', icon: TextAlignCenter },
        { title: ctx.t('complexPortableText.decorators.right'), value: 'right', icon: TextAlignRight },
      ],
      // annotations: [
      //   {
      //     name: 'link',
      //     type: 'object',
      //     title: ctx.t('complexPortableText.annotations.link'),
      //     icon: Link,
      //     fields: [{ name: 'href', type: 'url' }]
      //   },
      //   // ... internalLink, html etc
      // ]
    },
    
  })
};