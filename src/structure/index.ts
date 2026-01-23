import type {StructureResolver} from 'sanity/structure'
import {BasketIcon, CogIcon, HomeIcon, UserIcon, ConfettiIcon} from '@sanity/icons'
// import { Note } from 'phosphor-react'
import type { CoreFeaturesConfig } from '../types';

export const localizedStructure = (t: any, features: CoreFeaturesConfig) => {
  const structure: StructureResolver = (S, context) => {
    const items = []

    if (features.shop) {
      items.push(
        S.listItem()
          .title('Shop')
          .icon(BasketIcon)
          .child(
            S.list()
              .title('Shop')
              .items([
                S.documentTypeListItem('product').title('products'),
                S.documentTypeListItem('productVariant').title('productsVV'),
              ])
          )
      )
    }

    return S.list()
      .id('root')
      .title('content')
      .items(items)
  }
    
  return structure
}
