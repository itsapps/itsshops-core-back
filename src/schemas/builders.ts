import { ITSContext, CoreFactory, ITSBuilders } from '../types';
import { PriceInput } from '../components/PriceInput';

export const createBuilders = (factory: CoreFactory, ctx: ITSContext): ITSBuilders => {
  const { config, t: { default: t } } = ctx;
  const f = factory.fields;
  const ft = factory.fieldTranslators;
  const apiVersion = config.apiVersion

  
  return {
    internalLink: (options = { required: true }) => {
      const fieldName = options.name || 'link';
      const required = options.required || true;
      
      // Filter default 'to' based on config features
      const to = (options.to || config.schemaSettings.links.allowedReferences)
        // .filter(type => ctx.featureRegistry.isDocEnabled(type))
        .map(type => ({ type }))
      const displayTypes = options.displayTypes || ['link', 'button', 'ghost'];
      
      return [
        ...(options.includeTitle ? [f(`${fieldName}Title`, 'i18nString')] : []),
        f(`${fieldName}Reference`, 'reference', {
          to,
          // ...(options.required || true) && { validation: (Rule) => Rule.required() },
          validation: (Rule) => Rule.custom((value, context) => {
            const parent = context.parent as any;
            
            // If the item is a submenu or external link, this field isn't required
            if (parent?.linkType && parent.linkType !== 'internal') {
              return true;
            }
            
            // If it IS an internal link, we require the reference
            if (!value && required) {
              return 'A reference is required for internal links.';
            }
            
            return true;
          }),
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
        ...(options.includeDisplayType && displayTypes.length ? [
          f(`${fieldName}DisplayType`, 'string', {
            options: {
              list: displayTypes.map(type => ({value: type })),
              layout: 'radio',
              direction: 'horizontal'
            },
            // initialValue: 'link'
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
          
          // Settings fields
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

    block: (options) => {
      return {
        type: 'block',
        ...options,
        // ...options.styles && { styles: options.styles?.map(s => {
        //   return {
        //     ...s,
        //     ...(!s.title) && { title: ft.default(`block.styles.${s.value}`) },
        //   }
        // })},
        // marks: {
        //   ...options.marks?.decorators && {decorators: options.marks.decorators.map(d => {
        //     return {
        //       ...d,
        //       ...(!d.title) && { title: t(`fields.block.marks.decorators.${d.value}`) },
        //     }
        //   })},
        //   annotations: options.allowLinks ? [
        //     {
        //       name: 'internalLink',
        //       type: 'object',
        //       title: 'Internal Link',
        //       // Recursively call the link builder!
        //       fields: createBuilders(factory, ctx).internalLink({ 
        //         includeDisplayType: true 
        //       })
        //     }
        //   ] : []
        // }
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
                  fields: createBuilders(factory, ctx).internalLink({ 
                    includeDisplayType: true 
                  })
                }
              ] : []
            }
          },
          // f('image', 'baseImage')
          { type: 'image', title: 'bidlle' },
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
              ...createBuilders(factory, ctx).internalLink({ includeDisplayType: true })
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
    },
    countryCodeField: (options) => {
      return f(options.name || 'countryCode', 'string', {
        options: {
          list: ctx.countryOptions
        },
        // validation: (Rule) => Rule.required()
        validation: (Rule) => Rule.required().custom(async (value, context) => {
          const { document, getClient } = context;
          const client = getClient({ apiVersion });
          
          // Look for other documents with the same code that aren't this one
          const id = document?._id.replace('drafts.', '');
          const params = {
            type: options.documentType,
            code: value,
            id
          };
          
          const query = `*[_type == $type && countryCode == $code && _id != $id && !(_id in path("drafts.**"))][0]`;
          const alreadyExists = await client.fetch(query, params);

          return alreadyExists 
            ? `A configuration for ${value} already exists.` 
            : true;
        }),
      })
    },
    countryCodesField: (options) => {
      return f(options.name || 'countryCodes', 'array', {
        of: [{ type: 'string' }],
        options: {
          list: ctx.countryOptions
        },
      })
      // return {
      //   name: 'countries',
      //   type: 'array',
      //   of: [{ type: 'string' }],
      //   options: {
      //     list: config.localization.countries.map(country => ({ title: `${country.value} (${localizer.dictValue(country.title)})`, value: country.value }))
      //   },
      // }
    },
    // priceField: (ctx, options) => {
    //   ctx.f(options.name || 'price', 'number', {
    //     validation: (Rule) => Rule.positive(),
    //     ...options.group && { group: 'pricing'},
    //     components: {
    //       input: PriceInput,
    //     },
    //   }),
    // },
    priceField: (options) => {
      const { name, validation, ...rest } = options

      const field = f(name || 'price', 'number', {
        ...rest,
        validation: (Rule) => {
          const base = Rule.positive()
          const custom = validation ? validation(Rule) : [];
          return [
            base,
            ...(Array.isArray(custom) ? custom : [custom])
          ].filter(Boolean);
        },
        components: {
          input: PriceInput,
        },
      })
      return field
      // return f(name || 'price', 'number', {
      //   ...rest,
      //   validation: (Rule) => {
      //     const base = Rule.min(0)
      //     if (validation) {
      //       return [base, validation(Rule)]
      //     }
      //     return base
      //   },
      //   components: {
      //     input: PriceInput,
      //   },
      // })
    },
  };
};

// export const createITSBlock: ITSBuilderBlock = (options) => {
//   const {
//     styles,
//     marks,
//     ...rest
//   } = options

//   return defineArrayMember({
//     type: 'block',
//     styles: resolveStyles(styles),
//     marks: resolveMarks(marks),
//     ...rest
//   })
// }