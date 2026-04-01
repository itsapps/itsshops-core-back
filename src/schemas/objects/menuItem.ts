import { linkIcons, LinkIcon } from '../../assets/icons'
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
              return context.i18n.t('validation:generic.required')
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
          required: true,
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
              return context.i18n.t('validation:generic.required')
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
                    return context.i18n.t('validation:array.minimum-length', {
                      minLength: 1,
                    })
                  }

                  // 2. Depth Logic: Check nesting limit
                  const depth = path.filter((p) => p === 'children').length
                  const maxDepth = ctx.config.schemaSettings.menus.maxDepth

                  if (depth > maxDepth) {
                    return ctx.t.default(
                      'validation.menuMaxDepthExceeded',
                      `Maximum depth is ${maxDepth}`,
                      { maxDepth },
                    )
                  }

                  return true
                }),
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
          refTitle: 'internalLinkReference.title',
          children: 'children',
        },
        prepare: ({ title, linkType, url, refTitle, children }) => {
          const localTitle = ctx.localizer.value(title)
          const localRefTitle = ctx.localizer.value(refTitle)
          const localUrl = ctx.localizer.value(url)
          let subtitle = ''
          if (linkType === 'submenu') {
            const childrenCount = children?.length || 0
            subtitle = `${ctx.t.default('menuItem.preview.submenuItems', `${childrenCount} entries`, { count: childrenCount })}`
          } else if (linkType === 'external') {
            subtitle = `${localUrl || ctx.t.default('menuItem.preview.noUrl')}`
          } else if (linkType === 'internal') {
            subtitle = `${localRefTitle || ctx.t.default('menuItem.preview.noReference')}`
          }
          const media = linkIcons[linkType as keyof typeof linkIcons] || LinkIcon
          return {
            title: localTitle,
            subtitle,
            media,
          }
        },
      },
    }
  },
}
