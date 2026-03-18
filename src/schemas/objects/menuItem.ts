import { LinkIcon, InternalLinkIcon, ExternalLinkIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

export const menuItem: ITSSchemaDefinition = {
  name: 'menuItem',
  type: 'object',
  icon: LinkIcon,
  build: (ctx) => {
    const { f } = ctx
    const submenusEnabled = !ctx.config.schemaSettings.menus.disableSubmenus

    const allFields = [
      f('title', 'i18nString', {
        validation: (rule) =>
          rule.custom((value: any[] | undefined, context) => {
            const parent = context.parent as any
            if (parent?.linkType === 'submenu' && (!value || value.length === 0)) {
              return 'A title is required for submenus.'
            }
            return true
          }),
      }),

      // Use a hidden field or a select to determine "Link Type"
      // OR just provide both and the frontend picks.
      f('linkType', 'string', {
        options: {
          list: [
            { value: 'internal' },
            { value: 'external' },
            ...(submenusEnabled ? [{ value: 'submenu' }] : []),
          ],
          layout: 'radio',
          direction: 'horizontal',
        },
        initialValue: 'internal',
      }),

      // Internal Reference (Page, Post, etc.)
      ...ctx.builders
        .internalLinkFields({
          includeTitle: false,
          includeDisplayType: false,
          to: ctx.config.schemaSettings.menus.allowedReferences,
          required: false,
        })
        .map((field) => ({
          ...field,
          hidden: ({ parent }: any) => parent?.linkType !== 'internal',
        })),

      // External URL
      f('url', 'i18nUrl', {
        hidden: ({ parent }: any) => parent?.linkType !== 'external',
        // validation: (Rule) => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] })
        validation: (rule) =>
          rule.custom((value: any[] | undefined, context) => {
            const parent = context.parent as any
            if (parent?.linkType === 'external' && (!value || value.length === 0)) {
              return 'An external URL is required.'
            }
            return true
          }),
      }),

      // The Recursive Part: Children
      ...(submenusEnabled
        ? [
            f('children', 'array', {
              of: [{ type: 'menuItem' }],
              // Don't allow infinite nesting if you don't want to
              hidden: ({ parent }: any) => parent?.linkType !== 'submenu',
              // hidden: ({ parent }: any) => !!parent?.url || !!parent?.reference
              validation: (rule) =>
                rule.custom((value: any[] | undefined, context) => {
                  const parent = context.parent as any
                  const path = context.path || []
                  // 1. Logic: If it's a submenu, it MUST have at least one child
                  if (parent?.linkType === 'submenu' && (!value || value.length === 0)) {
                    return 'A submenu must contain at least one menu item.'
                  }

                  // 2. Depth Logic: Check nesting limit
                  const depth = path.filter((p) => p === 'children').length
                  const maxDepth = ctx.config.schemaSettings.menus.maxDepth

                  if (depth > maxDepth) {
                    return `Nesting is limited to ${maxDepth} levels.`
                  }

                  return true
                }),
              // validation: (Rule) => Rule.custom((value, context) => {
              //   // We walk up the document tree to see how many parents we have
              //   // context.path looks like ['items', 0, 'children', 2, 'children']
              //   const depth = context.path?.filter(p => p === 'children').length || 0;
              //   const maxDepth = ctx.config.schemaSettings.menus.maxDepth;

              //   if (depth > maxDepth) {
              //     return `Nesting is limited to ${maxDepth} levels.`;
              //   }
              //   return true;
              // })
            }),
          ]
        : []),
    ]
    const group = 'general'
    const fields = allFields.map((field) => ({ ...field, group }))

    return {
      groups: [{ name: group, default: true }],
      fields,
      preview: {
        select: {
          title: 'title',
          linkType: 'linkType',
          url: 'url',
          refTitle: 'linkReference.title',
          children: 'children',
        },
        prepare: ({ title, linkType, url, refTitle, children }) => {
          const localTitle = ctx.localizer.value(title)
          const localRefTitle = ctx.localizer.value(refTitle)
          const localUrl = ctx.localizer.value(url)

          const displayTitle = localTitle || localRefTitle || localUrl || 'Untitled'
          const linkTypeLabel = linkType ? ctx.t.default(`global.linkTypes.${linkType}`) : '-'
          let subtitle = `[${linkTypeLabel}]`

          if (linkType === 'submenu') {
            subtitle += ` 📂 ${children?.length || 0} items`
          } else if (linkType === 'external') {
            subtitle += ` 🌐 ${localUrl || 'No URL'}` // Snapshot of first i18n entry
          }

          const linkIcons = {
            internal: InternalLinkIcon,
            external: ExternalLinkIcon,
            submenu: LinkIcon,
          }
          const media = linkIcons[linkType as keyof typeof linkIcons] || LinkIcon
          return {
            title: displayTitle,
            subtitle,
            media,
          }
        },
        // prepare: ({ title, linkType, url, refTitle, children }) => {
        //   const localTitle = ctx.localizer.value(title);

        //   let sub = '';
        //   if (linkType === 'submenu') {
        //     const count = children?.length || 0;
        //     sub = count === 0 ? '⚠️ Empty Submenu' : `📂 ${count} items`;
        //   } else if (linkType === 'internal') {
        //     sub = ctx.localizer.value(refTitle) || 'No reference';
        //   } else if (linkType === 'external') {
        //     sub = url || 'No link';
        //   }

        //   return {
        //     title: localTitle || (linkType === 'submenu' ? 'Untitled Submenu' : 'Untitled Link'),
        //     subtitle: `[${linkType.toUpperCase()}] ${sub}`,
        //     media: Link
        //   };
        // }
        // prepare: ({ title, linkType, url, refTitle, children }) => {
        //   const sub = children?.length ? `${children.length} items` : (url || ctx.localizer.value(refTitle) || 'No link');
        //   return {
        //     title: ctx.localizer.value(title),
        //     subtitle: `[${linkType}] ${sub}`,
        //     media: Link
        //   };
        // }
      },
    }
  },
}
