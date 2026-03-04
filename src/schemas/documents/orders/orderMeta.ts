import { isDev } from 'sanity'

import { OrderIcon } from '../../../assets/icons'
import { ITSDocumentDefinition } from '../../../types'
import { buildShared } from './orderAndOrderMetaFields'

export const orderMeta: ITSDocumentDefinition = {
  name: 'orderMeta',
  type: 'document',
  icon: OrderIcon,
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
