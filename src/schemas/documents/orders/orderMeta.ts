import { TrolleyIcon } from '@sanity/icons'
import { isDev } from 'sanity'

import { ITSDocumentDefinition } from '../../../types'
import { buildShared } from './orderAndOrderMetaFields'

export const orderMeta: ITSDocumentDefinition = {
  name: 'orderMeta',
  type: 'document',
  icon: TrolleyIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  allowCreate: isDev,
  hideInStructure: true,
  build: (ctx) => {
    const shared = buildShared(ctx)
    // eslint-disable-next-line camelcase
    return { ...shared, __experimental_omnisearch_visibility: false }
  },
}
