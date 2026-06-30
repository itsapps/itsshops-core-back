import { UserIcon as Icon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

/**
 * Standalone newsletter subscriber. Decoupled from `customer`/Supabase auth so
 * visitors can subscribe without registering an account. The dedupe key is
 * `email`; `supabaseId` is an optional denormalized back-link for subscribers
 * that originated from a registered user (see `source`).
 *
 * All fields are managed by the core-front Netlify functions
 * (newsletter-subscribe / -confirm / -unsubscribe) and the registration
 * opt-in sync — the Studio view is read-only, for inspection/export.
 */
export const newsletterSubscriber: ITSDocumentDefinition = {
  name: 'newsletterSubscriber',
  type: 'document',
  icon: Icon,
  feature: 'newsletter',
  allowCreate: false,
  disallowedActions: ['duplicate'],
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('email', 'string', { readOnly: true }),
        f('locale', 'string', { readOnly: true }),
        f('status', 'string', {
          readOnly: true,
          options: {
            list: [{ value: 'pending' }, { value: 'confirmed' }, { value: 'unsubscribed' }],
            layout: 'dropdown',
          },
          validation: (rule) => rule.required(),
        }),
        f('source', 'string', {
          readOnly: true,
          options: {
            list: [{ value: 'standalone' }, { value: 'registration' }],
            layout: 'dropdown',
          },
        }),
        f('token', 'string', { readOnly: true }),
        f('supabaseId', 'string', { readOnly: true }),
        f('confirmedAt', 'datetime', { readOnly: true }),
        f('createdAt', 'datetime', { readOnly: true }),
      ],
      preview: {
        select: {
          email: 'email',
          status: 'status',
          source: 'source',
        },
        prepare: ({ email, status, source }) => {
          const statusIcons: Record<string, string> = {
            confirmed: '✅',
            unsubscribed: '🚫',
            pending: '⏳',
          }
          const icon = statusIcons[status] ?? '⏳'
          return {
            title: email || 'No email',
            subtitle: `${icon} ${status}${source ? ` · ${source}` : ''}`,
            media: Icon,
          }
        },
      },
    }
  },
}
