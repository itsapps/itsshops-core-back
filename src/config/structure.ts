import type { ITSContext, ITSStructureItem } from '../types';

import { type SanityDocument } from 'sanity'
import { EditIcon, BasketIcon, CogIcon, HomeIcon, UserIcon, ConfettiIcon } from '@sanity/icons'
import type { DefaultDocumentNodeResolver, StructureToolOptions } from 'sanity/structure'
import DocumentsPane from 'sanity-plugin-documents-pane'

import { categoriesMenu } from '../structure/categories';
import { fromRegistry, isDocHidden, localizedStructure } from '../utils/structure';
import { OrderView } from '../components/OrderView';
import { CustomerGroupView } from '../components/CustomerGroupView';

import {type UserViewComponent} from 'sanity/structure'
// type ExtractDocument<T extends React.ComponentType<any>> = React.ComponentProps<T>['document'];
type UserViewDocument = React.ComponentProps<UserViewComponent>['document']

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
        ...mapItems(['manufacturer', 'voucher']),
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
      id: 'customers',
      icon: UserIcon,
      feature: 'shop',
      children: mapItems(['customer', 'customerGroup'])
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
          S.view.component(OrderView).options({}).title(t('order.views.overview')),
          S.view.form().icon(EditIcon).title(t('views.titles.edit')),
        ])
      // case `customerGroup`:
      // //   return S.document().views([
      // //     S.view.form().icon(EditIcon).title(t('views.titles.edit')),
      // //     S.view.component(CustomerGroupView).title(t('customerGroup.views.overview')),
      // //   ])
      // case `product`:
      // case `productVariant`:
      // case `page`:
      // case `post`:
      // case `menu`:
      // case `variantOption`:
      // // case `variantOptionGroup`:
      // case `category`:
      default:
        return S.document().views([
          S.view.form(),
          S.view
            .component(DocumentsPane)
            .options({
              // debug: true,
              query: `*[references($id)]`,
              // query: `*[references($id)][0...10]`,
              // params: {id: '_id'},
              params: ({document}: {document: UserViewDocument}) => {
                return {id: document.draft?._id || document.published?._id || document.displayed?._id}
              },
              initialValueTemplates: initialValueReferenceTemplate,
            })
            .title(t('views.titles.references')),
        ])
      // default:
      //   return S.document().views([S.view.form()])
    }
  }
  return defaultDocumentNode
}

const initialValueReferenceTemplate = ({document}: {document: SanityDocument}) => {
  const templates = []

  // references must point to a non-draft ID, so if using the ID in the template,
  // be sure it doesn't start with `drafts.`
  const id = document?.displayed?._id.replace('drafts.', '')
  const name = document?.displayed?.name || 'author'

  if (id) {
    templates.push({
      // the name of the schema type that should be created (required)
      schemaType: 'post',
      // the title that should appear on the button - we can customize it (required)
      title: `New post by ${name}`,
      // the name of the template that should be used (optional)
      template: 'postWithAuthor',
      // values for parameters that can be passed to the template referenced above (optional)
      parameters: {
        authorId: id,
      },
    })

    // we could push more templates if needed.
  }

  // must always return a list, even if empty
  return templates
}