import type { ITSContext, ITSStructureItem } from '../types';
import { type StructureToolOptions } from 'sanity/structure'
import { EditIcon, BasketIcon, CogIcon, HomeIcon, UserIcon, ConfettiIcon } from '@sanity/icons'
import type {DefaultDocumentNodeResolver} from 'sanity/structure'
import DocumentsPane from 'sanity-plugin-documents-pane'
import { categoriesMenu } from '../structure/categories';
import { fromRegistry, isDocHidden, localizedStructure } from '../utils/structure';
import { OrderView } from '../components/OrderView';

export const createStructureTool = (ctx: ITSContext): StructureToolOptions => {
  return {
    title: ctx.t.default('structure'),
    structure: createStructure(ctx),
    defaultDocumentNode: createDefaultDocumentNode(ctx),
  }
}

export const createStructure = (ctx: ITSContext) => {
  const mapItems = (ids: string[]) => ids.map(id => fromRegistry(ctx, id));


  const coreManifest: ITSStructureItem[] = [
    {
      type: 'group',
      id: 'website',
      icon: HomeIcon,
      children: mapItems(['page', 'post', 'menu'])
    },
    {
      type: 'group',
      id: 'shop',
      icon: BasketIcon,
      feature: 'shop',
      children: [
        ...mapItems(['order', 'orderMeta', 'product', 'productBundle', 'productVariant', 'variantOptionGroup', 'variantOption']),
        { type: 'custom', id: 'categories', feature: 'shop.category', component: categoriesMenu, hidden: isDocHidden(ctx, 'category') },
        ...mapItems(['manufacturer']),
      ]
    },
    // {
    //   type: 'group',
    //   id: 'marketing',
    //   icon: ConfettiIcon,
    //   feature: 'shop',
    //   children: mapItems(['voucher'])
    // },
    {
      type: 'divider',
      id: 'mainDivider',
    },
    {
      type: 'group',
      id: 'users',
      icon: UserIcon,
      feature: 'shop',
      children: mapItems(['user', 'customerGroup'])
    },
    {
      type: 'group',
      id: 'settingsGroup',
      icon: CogIcon,
      children: [
        ...mapItems(['settings']),
        {
          type: 'group',
          id: 'shopSettingsGroup',
          icon: CogIcon,
          children: mapItems(['shopSettings', 'shippingMethod', 'taxCountry', 'taxCategory'])
        },
      ]
    },
  ];
  return localizedStructure(ctx, coreManifest);
}

export const createDefaultDocumentNode = (ctx: ITSContext) => {
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
      // case `variantOptionGroup`:
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