import type {StructureResolver} from 'sanity/structure'
import {BasketIcon, CogIcon, HomeIcon, UserIcon, ConfettiIcon} from '@sanity/icons'
// import { Note } from 'phosphor-react'
import type { SchemaContext } from '../types';

export const localizedStructure = (ctx: SchemaContext) => {
  const { t, config } = ctx;
  const features = config.features
  const structure: StructureResolver = (S, context) => {
    const items = []

    if (features.shop) {
      items.push(
        S.listItem()
          .title(t('structure:shop'))
          .icon(BasketIcon)
          .child(
            S.list()
              .title(t('structure:shop'))
              .items([
                S.documentTypeListItem('product').title(t('structure:products')),
                S.documentTypeListItem('productVariant').title(t('structure:productVariants')),
              ])
          )
      )
    }

    return S.list()
      .id('root')
      .title(t('structure:content'))
      .items(items)
  }
    
  return structure
}
