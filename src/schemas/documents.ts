import { CoreDocument } from '../types'

import { blog } from './documents/blog'
import { category } from './documents/category'
import { customerGroup } from './documents/customerGroup'
import { manufacturer } from './documents/manufacturer'
import { menu } from './documents/menu'
import { order } from './documents/order'
import { orderMeta } from './documents/orderMeta'
import { page } from './documents/page';
import { post } from './documents/post';
import { product } from './documents/product'
import { productVariant } from './documents/productVariant'
import { settings } from './documents/settings';
import { shippingCountry } from './documents/shippingCountry'
import { user } from './documents/user'
import { variantOption } from './documents/variantOption'
import { variantOptionGroup } from './documents/variantOptionGroup'
import { voucher } from './documents/voucher';

export const getCoreDocuments = (extensions: CoreDocument[] | undefined): CoreDocument[] => {
  return [
    blog, category, customerGroup, manufacturer, menu, order, orderMeta, page, post, product, productVariant,
    settings, shippingCountry, user, variantOption, variantOptionGroup, voucher,
    ...extensions ? extensions : [],
  ]
}