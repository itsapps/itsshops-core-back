import { linkIcons, LinkIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'
import { enabledSystemPages as getEnabledSystemPages } from '../systemPages'

/** Type name of the menu item at `level` (0 = top level): menuItem, menuItem1, menuItem2, … */
export const menuItemTypeName = (level: number) => (level === 0 ? 'menuItem' : `menuItem${level}`)

/** Number of menu levels the Studio offers, top level included (1 = flat menus). */
export const menuLevels = (menus: { maxDepth: number }) => Math.max(1, menus.maxDepth)

/**
 * One item type per menu level, all built from this definition; labels, schema extension and
 * preview are shared through `baseName: 'menuItem'`. Sanity choice lists are static, so a level
 * gets the `submenu` choice and a `children` field only when a deeper level exists — the last
 * level is link-only and no depth rule is needed. `maxDepth` counts levels, top level included.
 */
export const menuItemTypes = (levels: number): ITSSchemaDefinition[] =>
  Array.from({ length: levels }, (_, level) => createMenuItem(level, levels))

const createMenuItem = (level: number, levels: number): ITSSchemaDefinition => ({
  name: menuItemTypeName(level),
  baseName: 'menuItem',
  type: 'object',
  icon: LinkIcon,
  build: (ctx) => {
    const { f } = ctx
    // a submenu at this level holds items of the next level
    const submenusEnabled = level < levels - 1
    const enabledSystemPages = getEnabledSystemPages(ctx)

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
            ...(enabledSystemPages.length ? [{ value: 'system' }] : []),
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

      // System page (fixed core route, e.g. the withdrawal form)
      ...(enabledSystemPages.length
        ? [
            f('systemPage', 'string', {
              options: {
                list: enabledSystemPages.map(({ value }) => ({ value })),
                layout: 'radio',
              },
              hidden: ({ parent }: any) => parent?.linkType !== 'system',
              validation: (rule) =>
                rule.custom((value: string | undefined, context) => {
                  const parent = context.parent as any
                  if (parent?.linkType === 'system' && !value) {
                    return context.i18n.t('validation:generic.required')
                  }
                  return true
                }),
            }),
          ]
        : []),

      // The Recursive Part: Children
      ...(submenusEnabled
        ? [
            f('children', 'array', {
              of: [{ type: menuItemTypeName(level + 1) }],
              hidden: ({ parent }: any) => parent?.linkType !== 'submenu',
              // hidden: ({ parent }: any) => !!parent?.url || !!parent?.reference
              validation: (rule) =>
                rule.custom((value: any[] | undefined, context) => {
                  const parent = context.parent as any
                  // A submenu must have at least one child
                  if (parent?.linkType === 'submenu' && (!value || value.length === 0)) {
                    return context.i18n.t('validation:array.minimum-length', {
                      minLength: 1,
                    })
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
          systemPage: 'systemPage',
        },
        prepare: ({ title, linkType, url, refTitle, children, systemPage }) => {
          const localTitle = ctx.localizer.value(title)
          const localRefTitle = ctx.localizer.value(refTitle)
          const localUrl = ctx.localizer.value(url)
          let subtitle = ''
          if (linkType === 'submenu') {
            const childrenCount = children?.length || 0
            subtitle = `${ctx.t.default('menuItem.preview.submenuItems', `${childrenCount} entries`, { count: childrenCount })}`
          } else if (linkType === 'external') {
            subtitle = `${localUrl || ctx.t.default('menuItem.preview.noUrl')}`
          } else if (linkType === 'system') {
            subtitle = systemPage
              ? ctx.t.default(`menuItem.fields.systemPage.options.${systemPage}`, systemPage)
              : ''
          } else if (linkType === 'internal') {
            subtitle = `${localRefTitle || ctx.t.default('menuItem.preview.noReference')}`
          }
          const media = linkIcons[linkType as keyof typeof linkIcons] || LinkIcon
          return {
            title:
              localTitle ||
              (linkType === 'system' && systemPage
                ? ctx.t.default(`menuItem.fields.systemPage.options.${systemPage}`, systemPage)
                : localTitle),
            subtitle,
            media,
          }
        },
      },
    }
  },
})
