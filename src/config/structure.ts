// type ExtractDocument<T extends React.ComponentType<any>> = React.ComponentProps<T>['document'];
import type {
  DefaultDocumentNodeResolver,
  StructureResolver,
  StructureToolOptions,
} from 'sanity/structure'

// import { CustomerGroupView } from '../components/CustomerGroupView';
import { EditIcon, SettingsIcon, ShopIcon, UserIcon, WebsiteIcon } from '../assets/icons'
import { OrderView } from '../components/OrderView'
import { categoriesMenu } from '../structure/categories'
import { productsMenu } from '../structure/products'
import {
  fromRegistry,
  getReferenceView,
  isDocHidden,
  localizedStructure,
} from '../structure/structure'
import { variantOptionsMenu } from '../structure/variantOptions'
import type { ITSContext, ITSStructureItem } from '../types'

export const createStructure = (ctx: ITSContext): StructureResolver => {
  const mapItems = (ids: string[]) => ids.map((id) => fromRegistry(ctx, id))

  const coreManifest: ITSStructureItem[] = [
    {
      type: 'group',
      id: 'website',
      icon: WebsiteIcon,
      children: mapItems(['page', 'post', 'menu']),
    },
    {
      type: 'group',
      id: 'shop',
      icon: ShopIcon,
      feature: 'shop',
      children: [
        ...mapItems(['order', 'orderWithdrawal', 'orderMeta']),
        {
          type: 'custom',
          id: 'products',
          feature: 'shop',
          component: productsMenu,
          hidden: isDocHidden(ctx, 'product'),
        },
        ...mapItems(['productVariant']),
        {
          type: 'custom',
          id: 'variantOptions',
          feature: 'shop.productKind.options',
          component: variantOptionsMenu,
          hidden: isDocHidden(ctx, 'variantOptionGroup'),
        },
        {
          type: 'custom',
          id: 'categories',
          feature: 'shop.category',
          component: categoriesMenu,
          hidden: isDocHidden(ctx, 'category'),
        },
        ...mapItems(['manufacturer', 'voucher', 'coupon']),
      ],
    },
    {
      type: 'divider',
      id: 'mainDivider',
    },
    {
      type: 'group',
      id: 'customers',
      icon: UserIcon,
      feature: 'shop',
      children: mapItems(['customer', 'customerGroup']),
    },
    {
      type: 'group',
      id: 'settingsGroup',
      icon: SettingsIcon,
      children: [
        ...mapItems(['settings', 'blog']),
        {
          type: 'group',
          id: 'shopSettingsGroup',
          icon: SettingsIcon,
          children: mapItems(['shopSettings', 'taxCategory', 'taxCountry', 'shippingMethod']),
        },
      ],
    },
  ]
  return localizedStructure(ctx, coreManifest)
}

export const createDefaultDocumentNode = (ctx: ITSContext): DefaultDocumentNodeResolver => {
  const t = ctx.structureT.default

  const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
    switch (schemaType) {
      case `order`:
        return S.document().views([
          S.view.component(OrderView).title(t('views.titles.overview')),
          S.view.form().icon(EditIcon).title(t('views.titles.edit')),
        ])
      default:
        return S.document().views([
          S.view.form(),
          // ...(schemaType === `product` ? [getProductReferenceView(S, t('products.variants'))] : []),
          getReferenceView(S, t('views.titles.references')),
        ])
    }
  }
  return defaultDocumentNode
}

export const createStructureTool = (ctx: ITSContext): StructureToolOptions => {
  return {
    title: ctx.structureT.default('structure.title'),
    structure: createStructure(ctx),
    defaultDocumentNode: createDefaultDocumentNode(ctx),
  }
}
