// packages/core-back/src/schemas/objects/complexPortableText.ts
import { CoreObject, FieldContext } from '../../types';
import { TextAlignLeft, TextAlignRight, TextAlignCenter, Code, Link } from 'phosphor-react';

export const complexPortableText: CoreObject = {
  name: 'complexPortableText',
  type: 'block', // Blocks are wrapped in objects or used in arrays
  build: (ctx: FieldContext) => ({
    marks: {
      decorators: [
        { title: ctx.helpers.t.default('complexPortableText.decorators.strong'), value: 'strong' },
        { title: ctx.helpers.t.default('complexPortableText.decorators.emphasis'), value: 'em' },
        { title: ctx.helpers.t.default('complexPortableText.decorators.left'), value: 'left', icon: TextAlignLeft },
        { title: ctx.helpers.t.default('complexPortableText.decorators.center'), value: 'center', icon: TextAlignCenter },
        { title: ctx.helpers.t.default('complexPortableText.decorators.right'), value: 'right', icon: TextAlignRight },
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