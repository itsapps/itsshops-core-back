import { ITSSchemaDefinition } from '../../types';
import { Link } from 'phosphor-react'
import { getInternalLinkFields } from './internalLink';

export const menuItem: ITSSchemaDefinition = {
  name: 'menuItem',
  type: 'object',
  icon: Link,
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('title', 'i18nString'),
        
        // Use a hidden field or a select to determine "Link Type" 
        // OR just provide both and the frontend picks.
        f('linkType', 'string', {
          options: {
            list: [
              { title: 'Internal Page', value: 'internal' },
              { title: 'External URL', value: 'external' },
              { title: 'Sub-Menu (No Link)', value: 'none' },
            ],
            layout: 'radio',
            direction: 'horizontal',
          },
          initialValue: 'internal'
        }),

        // Internal Reference (Page, Post, etc.)
        // We use our helper here!
        ...getInternalLinkFields(ctx, { 
          to: ['page', 'post', 'category'],
          includeTitle: false,
          includeDisplayType: false 
        }).map(field => ({
          ...field,
          hidden: ({ parent }: any) => parent?.linkType !== 'internal'
        })),

        // External URL
        f('url', 'url', {
          hidden: ({ parent }: any) => parent?.linkType !== 'external',
          validation: (Rule) => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] })
        }),

        // Menu Specific: Images (from your old navPage)
        // f('images', 'menuItemImage'),

        // The Recursive Part: Children
        f('children', 'array', {
          title: 'Sub-Menu Items',
          of: [{ type: 'menuItem' }],
          // Don't allow infinite nesting if you don't want to
          hidden: ({ parent }: any) => parent?.linkType !== 'none',
          // hidden: ({ parent }: any) => !!parent?.url || !!parent?.reference
        }),
      ],
      preview: {
        select: {
          title: 'title',
          linkType: 'linkType',
          url: 'url',
          refTitle: 'reference.title',
          children: 'children'
        },
        prepare: ({ title, linkType, url, refTitle, children }) => {
          const sub = children?.length ? `${children.length} items` : (url || ctx.localizer.value(refTitle) || 'No link');
          return {
            title: ctx.localizer.value(title),
            subtitle: `[${linkType}] ${sub}`,
          };
        }
      }
    };
  }
};