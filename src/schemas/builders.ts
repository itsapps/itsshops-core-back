import { ITSContext, FieldFactory, ITSBuilders } from '../types';

export const createBuilders = (f: FieldFactory, ctx: ITSContext): ITSBuilders => {
  const { config, t: { default: t } } = ctx;
  
  return {
    internalLink: (options = { required: true }) => {
      const fieldName = options.name || 'link';
      
      // Filter default 'to' based on config features
      const to = (options.to || config.schemaSettings.links.allowedReferences)
        .filter(type => ctx.featureRegistry.isDocEnabled(type))
        .map(type => ({ type }))
      
      return [
        ...(options.includeTitle ? [f(`${fieldName}Title`, 'i18nString')] : []),
        f(`${fieldName}Reference`, 'reference', {
          to,
          ...(options.required || true) && { validation: (Rule) => Rule.required() },
          // TODO: dynamic filter
          options: {
            // filter: options.to?.includes('product') ? `...your product filter...` : ''
            filter: `
              (!defined(active) && _type != "product") ||
              (active == true && _type == "productVariant") ||
              ((!defined(variants) || count(variants) == 0) && _type == "product")
            `
          }
        }),
        ...(options.includeDisplayType ? [
          f(`${fieldName}DisplayType`, 'string', {
            options: {
              list: [
                { title: t(`${fieldName}DisplayType.options.link`), value: 'link' },
                { title: t(`${fieldName}DisplayType.options.button`), value: 'button' },
                { title: t(`${fieldName}DisplayType.options.ghost`), value: 'ghost' },
              ],
              layout: 'radio',
              direction: 'horizontal'
            },
            initialValue: 'link'
          })
        ] : [])
      ];
    },

    /**
     * MODULE WRAPPER
     * Wraps raw fields with "Settings" like visibility and anchors.
     */
    module: (options) => {
      return {
        // name: options.name,
        // type: 'object',
        groups: [
          { name: 'content', default: true },
          { name: 'settings' }
        ],
        fields: [
          // Content fields (assigned to content group)
          ...options.fields.map(field => ({ ...field, group: field.group || 'content' })),
          
          // Global Settings (The "Stuff")
          f('disabled', 'boolean', { 
            group: 'settings', 
            initialValue: false 
          }),
          ...(options.allowAnchor ? [
            f('anchorId', 'string', { 
              group: 'settings',
              description: 'Used for #anchor-links' 
            })
          ] : []),
          ...(options.allowTheme ? [
            f('theme', 'string', {
              group: 'settings',
              options: { list: ['light', 'dark', 'accent'] },
              initialValue: 'light'
            })
          ] : [])
        ]
      };
    },

    /**
     * PORTABLE TEXT BUILDER
     * Context-aware text editor configuration.
     */
    portableText: (options = {}) => {
      return {
        of: [
          {
            type: 'block',
            styles: options.styles?.map(s => ({ title: s, value: s })) || [
              { title: 'Normal', value: 'normal' },
              { title: 'H2', value: 'h2' },
              { title: 'H3', value: 'h3' },
            ],
            marks: {
              annotations: options.allowLinks ? [
                {
                  name: 'internalLink',
                  type: 'object',
                  title: 'Internal Link',
                  // Recursively call the link builder!
                  fields: createBuilders(f, ctx).internalLink({ 
                    includeDisplayType: true 
                  })
                }
              ] : []
            }
          },
          // f('image', 'baseImage')
          { type: 'image' }
        ]
      };
    },
    actionGroup: (options = {}) => {
      const name = options.name || 'actions';
      
      return f(name, 'array', {
        of: [
          {
            type: 'object',
            name: 'action',
            // We use the internalLink builder INSIDE the array item
            fields: [
              // f('label', 'i18nString', { i18n: 'requiredDefault' }),
              ...createBuilders(f, ctx).internalLink({ includeDisplayType: true })
            ],
            // Preview so the editor sees the label in the list
            preview: {
              select: { title: 'label' },
              prepare({ title }) {
                return { title: ctx.localizer.value(title) || 'Untitled Action' };
              }
            }
          }
        ],
        validation: (Rule: any) => options.max ? Rule.max(options.max) : Rule
      });
    }
  };
};