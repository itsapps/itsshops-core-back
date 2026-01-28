import { OrderView } from '../components/OrderView';

import {EditIcon} from '@sanity/icons'
import type {DefaultDocumentNodeResolver} from 'sanity/structure'
import DocumentsPane from 'sanity-plugin-documents-pane'

import type { ITSContext, ITSStructureItem } from '../types';

// const JsonPreview = ({document}) => (
//   <pre>{JSON.stringify(document, null, 2)}</pre>
// )

export const localizedDefaultDocumentNode = (ctx: ITSContext) => {
  const t = ctx.t.default

  const defaultDocumentNode: DefaultDocumentNodeResolver = (S, {schemaType}) => {
    switch (schemaType) {
      case `order`:
        return S.document().views([
          S.view.component(OrderView).title(t('order.views.overview')),
          S.view.form().icon(EditIcon).title(t('views.titles.edit')),
        ])
      case `product`:
      case `productVariant`:
      case `page`:
      case `post`:
      case `menu`:
      case `variantOption`:
      case `category`:
        return S.document().views([
          S.view.form(),
          S.view
            .component(DocumentsPane)
            .options({
              query: `*[references($id)]`,
              // query: `*[references($id)][0...10]`,
              params: {id: `_id`},
            })
            .title(t('views.titles.references')),
        ])
      default:
        return S.document().views([S.view.form()])
    }
  }
  return defaultDocumentNode
}