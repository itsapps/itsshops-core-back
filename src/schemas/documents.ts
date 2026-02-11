import { ITSSchemaDefinition } from '../types'

import { blog } from './documents/blog'
import { category } from './documents/category'
import { customerGroup } from './documents/customerGroup'
import { manufacturer } from './documents/manufacturer'
import { menu } from './documents/menu'
import { order } from './documents/orders/order'
import { orderMeta } from './documents/orders/orderMeta'
import { page } from './documents/page';
import { post } from './documents/post';
import { product } from './documents/product'
import { productBundle } from './documents/productBundle'
import { productVariant } from './documents/productVariant'
import { settings } from './documents/settings';
import { shippingMethod } from './documents/shippingMethod'
import { taxCategory } from './documents/taxCategory'
import { shopSettings } from './documents/shopSettings'
import { taxCountry } from './documents/taxCountry'
import { user } from './documents/user'
import { variantOption } from './documents/variantOption'
import { variantOptionGroup } from './documents/variantOptionGroup'
import { voucher } from './documents/voucher';

export const getCoreDocuments = (extensions: ITSSchemaDefinition[] | undefined): ITSSchemaDefinition[] => {
  // remove feature from extensions, if accidently added, because it makes no sense here
  const extensionsWithoutFeature = extensions?.map(d => {
    const { feature, ...rest } = d;
    return rest;
  }) || [];

  return [
    blog, category, customerGroup, manufacturer, menu, order, orderMeta, page, post, product, productBundle, productVariant,
    settings, shippingMethod, shopSettings, taxCountry, taxCategory, user, variantOption, variantOptionGroup, voucher,
    ...extensionsWithoutFeature,
  ]
}