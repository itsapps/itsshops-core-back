import { UserIcon } from '@sanity/icons'
import { ITSDocumentDefinition } from "../../types";

import { FieldDefinition } from 'sanity'

export const customer: ITSDocumentDefinition = {
  name: 'customer',
  type: 'document',
  icon: UserIcon,
  feature: 'users',
  disallowedActions: [ 'duplicate' ],
  build: (ctx) => {
    const { f } = ctx;
    const groups = ['general', 'address' ].map((name, index) => ({
      name, ...index === 0 && { default: true }
    }));

    const fieldsMap: Record<string, FieldDefinition[]> = {
      general: [
        f('email', 'string'),
        
        f('locale', 'string', {
          options: {
            list: ctx.config.localization.uiLanguages.map(language => ({ title: language.title, value: language.id }))
          },
        }),

        f('receiveNewsletter', 'boolean', {
          initialValue: false,
        }),

        f('customerNumber', 'string'),
        f('customerGroups', 'array', {
          of: [{
            type: 'reference',
            to: [{ type: 'customerGroup' }],
          }],
        }),

        f('supabaseId', 'string', {
          readOnly: true,
        }),

        f('status', 'string', {
          options: {
            list: [
              { value: 'registered' },
              { value: 'invited' },
              { value: 'active' },
            ],
            layout: 'dropdown'
          },
          validation: (rule) => rule.required(),

        }),
      ],
      address: [
        f('address', 'address', {
        }),
      ]
    }

    const fields = groups.map(({ name }) => ([
      ...fieldsMap[name].map(field => ({ ...field, group: name }))
    ])).flat();

    return {
      groups,
      fields,
      preview: {
        select: {
          address: 'address',
          status: 'status',
          newsletter: 'receiveNewsletter',
        },
        prepare: ({address, status, newsletter}) => {
          const title = [address?.prename, address?.lastname].filter(Boolean).join(' ') || 'No Name';
          const statusString = `${ctx.t.default('customer.fields.status.options.active')}: ${status === 'active' ? "✅" : "❌"}`
          const newsletterString = `${ctx.t.default('customer.fields.receiveNewsletter.title')}: ${newsletter ? "✅" : "❌"}`
          const subtitle = `${statusString}, ${newsletterString}`
          return {
            title,
            subtitle,
            media: UserIcon
          }
        }
      },
    }
  }
};
