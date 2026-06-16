import { WineIcon, FilterIcon, ProductVariantIcon } from '../assets/icons'
import { PriceInput } from '../components/PriceInput'
import { CoreFactory, ITSBuilders, ITSContext } from '../types'

export const createBuilders = (factory: CoreFactory, ctx: ITSContext): ITSBuilders => {
  const { config } = ctx
  const f = factory.fields
  // const ft = factory.fieldTranslators;
  const apiVersion = config.apiVersion

  return {
    externalLinkFields: (options = {}) => {
      const fieldName = options.name || 'externalLink'
      // const required = options.required || true

      return [
        ...(options.includeTitle ? [f(`${fieldName}Title`, 'i18nString')] : []),
        f(`${fieldName}Url`, 'url', {
          validation: (Rule) =>
            Rule.uri({
              scheme: ['http', 'https', 'mailto', 'tel'],
            }),
        }),
        f(`${fieldName}Blank`, 'boolean', { initialValue: true }),
        //   {
        //   name: 'href',
        //   title: t('link.href.title'),
        //   description: t('link.href.description'),
        //   type: 'url',
        //   validation: Rule =>
        //     Rule.uri({
        //       scheme: ['http', 'https', 'mailto', 'tel']
        //     }),
        // },
      ]
    },
    internalLinkFields: (options = {}) => {
      const fieldName = options.name || 'internalLink'
      const required = options.required ?? true

      // Filter default 'to' based on config features
      const to = (options.to || config.schemaSettings.links.allowedReferences)
        // .filter(type => ctx.featureRegistry.isDocEnabled(type))
        .map((type) => ({ type }))
      const displayTypes = options.displayTypes || ['link', 'button', 'ghost']

      return [
        ...(options.includeTitle ? [f(`${fieldName}Title`, 'i18nString')] : []),
        f(`${fieldName}Reference`, 'reference', {
          to,
          // ...(options.required || true) && { validation: (Rule) => Rule.required() },
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as any

              // If the item is a submenu or external link, this field isn't required
              if (parent?.linkType && parent.linkType !== 'internal') {
                return true
              }

              // If it IS an internal link, we require the reference
              if (!value && required) {
                return ctx.t.default('validation.requiredField')
              }

              return true
            }),
          options: {
            filter: `
              (!defined(active) && _type != "product") ||
              (active == true && _type == "productVariant") ||
              ((!defined(variants) || count(variants) == 0) && _type == "product")
            `,
          },
        }),
        ...(options.includeDisplayType && displayTypes.length
          ? [
              f(`${fieldName}DisplayType`, 'string', {
                options: {
                  list: displayTypes.map((type) => ({ value: type })),
                  layout: 'radio',
                  direction: 'horizontal',
                },
                // initialValue: 'link'
              }),
            ]
          : []),
      ]
    },

    /**
     * MODULE WRAPPER
     * Wraps raw fields with "Settings" like visibility and anchors.
     */
    module: (options) => {
      return {
        groups: [
          { name: 'content', default: true },
          ...(options.groups ? options.groups : []),
          { name: 'settings' },
        ],
        fields: [
          // Content fields (assigned to content group)
          ...options.fields.map((field) => ({ ...field, group: field.group || 'content' })),

          // Settings fields
          f('disabled', 'boolean', {
            group: 'settings',
            initialValue: false,
          }),
          ...(options.allowAnchor
            ? [
                f('anchorId', 'string', {
                  group: 'settings',
                }),
              ]
            : []),
          ...(options.allowTheme
            ? [
                f('theme', 'string', {
                  group: 'settings',
                  options: { list: [{ value: 'light' }, { value: 'dark' }, { value: 'accent' }] },
                  initialValue: 'light',
                }),
              ]
            : []),
        ],
      }
    },

    variantReferences: () => {
      return f('products', 'array', {
        of: [
          {
            type: 'reference',
            title: ctx.t.default('product.title'),
            to: [{ type: 'productVariant' }],
            options: { disableNew: true, filter: 'status != "archived"' },
          },
        ],
      })
    },

    variantReference: () => ({
      name: 'variantLink',
      type: 'reference' as const,
      icon: ProductVariantIcon,
      to: [{ type: 'productVariant' }],
      options: { disableNew: true, filter: 'status != "archived"' },
    }),

    actionGroup: (options = {}) => {
      const name = options.name || 'actions'

      return f(name, 'array', {
        of: [
          {
            type: 'object',
            name: 'action',
            // We use the internalLink builder INSIDE the array item
            fields: [
              // f('label', 'i18nString', { i18n: 'requiredDefault' }),
              ...createBuilders(factory, ctx).internalLinkFields({
                includeTitle: options.includeTitle || false,
                includeDisplayType: options.includeDisplayType || false,
              }),
            ],
            // Preview so the editor sees the label in the list
            preview: {
              select: {
                linkTitle: 'internalLinkTitle',
                linkReferenceTitle: 'internalLinkReference.title',
              },
              prepare({ linkTitle, linkReferenceTitle }) {
                return {
                  title:
                    ctx.localizer.value(linkTitle) ||
                    ctx.localizer.value(linkReferenceTitle) ||
                    'Untitled Action',
                }
              },
            },
          },
        ],
        validation: (rule) => (options.max ? rule.max(options.max) : rule),
      })
    },
    countryCodeField: (options) => {
      return f(options.name || 'countryCode', 'string', {
        options: {
          list: ctx.constants.countryOptions,
        },
        // validation: (Rule) => Rule.required()
        validation: (rule) =>
          rule.required().custom(async (value, context) => {
            const { document, getClient } = context
            const client = getClient({ apiVersion })

            // Look for other documents with the same code that aren't this one
            const id = document?._id.replace('drafts.', '')
            const params = {
              type: options.documentType,
              code: value,
              id,
            }

            const query = `*[_type == $type
              && countryCode == $code
              && _id != $id
              && !(_id in path("drafts.**"))
            ][0]`
            const alreadyExists = await client.fetch(query, params)

            return alreadyExists
              ? ctx.t.default(
                  'validation.countryCodeNoDuplicates',
                  `A configuration for ${value} already exists.`,
                  { countryCode: value as string },
                )
              : true
          }),
      })
    },
    countryCodesField: (options) => {
      return f(options.name || 'countryCodes', 'array', {
        of: [{ type: 'string' }],
        options: {
          list: ctx.constants.countryOptions,
        },
      })
    },

    priceField: (options = {}) => {
      const { name, validation, ...rest } = options

      const field = f(name || 'price', 'number', {
        ...rest,
        validation: (Rule) => {
          const base = Rule.positive()
          const custom = validation ? validation(Rule) : []
          return [base, ...(Array.isArray(custom) ? custom : [custom])].filter(Boolean)
        },
        components: {
          input: PriceInput,
        },
      })
      return field
    },

    buildGroupedSchema: (props) => {
      const groups = props.map((item, index) => ({
        name: item.name,
        icon: item.icon,
        default: index === 0,
      }))

      const fields = props.flatMap((item) =>
        item.fields.map((field) => ({
          ...field,
          group: item.name,
        })),
      )

      return { groups, fields }
    },
    filterField: () => {
      const hasWine = ctx.featureRegistry.isFeatureEnabled('shop.productKind.wine')
      const hasOptions = ctx.featureRegistry.isFeatureEnabled('shop.productKind.options')

      const wft = (key: string) => ctx.t.strict(`productList.wineFieldFilter.${key}`)
      const pft = (key: string) => ctx.t.strict(`productList.productFieldFilter.${key}`)

      const of = [
        // Generic product field filters (always available)
        {
          type: 'object' as const,
          name: 'productFieldFilter',
          title: pft('title') || 'Product Filter',
          icon: FilterIcon,
          fields: [
            {
              name: 'field',
              type: 'string',
              title: pft('fields.field.title') || 'Field',
              options: {
                list: [
                  { value: 'price', title: pft('fields.field.options.price') || 'Price' },
                  { value: 'category', title: pft('fields.field.options.category') || 'Category' },
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
              validation: (rule: any) => rule.required(),
            },
          ],
          preview: {
            select: { field: 'field' },
            prepare({ field }: any) {
              return { title: pft(`fields.field.options.${field}`) || '—' }
            },
          },
        },
        ...(hasWine
          ? [
              {
                type: 'object' as const,
                name: 'wineFieldFilter',
                title: wft('title') || 'Wine Field Filter',
                icon: WineIcon,
                fields: [
                  {
                    name: 'field',
                    type: 'string',
                    title: wft('fields.field.title') || 'Field',
                    options: {
                      list: [
                        {
                          value: 'vintage',
                          title: wft('fields.field.options.vintage') || 'Vintage',
                        },
                        {
                          value: 'varietal',
                          title: wft('fields.field.options.varietal') || 'Varietal',
                        },
                        { value: 'color', title: wft('fields.field.options.color') || 'Color' },
                        {
                          value: 'classification',
                          title: wft('fields.field.options.classification') || 'Classification',
                        },
                        {
                          value: 'volume',
                          title: wft('fields.field.options.volume') || 'Volume',
                        },
                      ],
                      layout: 'radio',
                      direction: 'horizontal',
                    },
                    validation: (rule: any) => rule.required(),
                  },
                ],
                preview: {
                  select: {
                    field: 'field',
                  },
                  prepare({ field }: any) {
                    return {
                      title: wft(`fields.field.options.${field}`) || '—',
                    }
                  },
                },
              },
            ]
          : []),
        ...(hasOptions
          ? [
              {
                type: 'reference' as const,
                to: [{ type: 'variantOptionGroup' }],
                title: ctx.schemaT.strict('variantOptionGroup.title') || 'Option Group',
                options: { disableNew: true },
              },
            ]
          : []),
      ]

      if (!of.length) return []
      return [f('filters', 'array', { of })]
    },
  }
}
