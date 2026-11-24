import { Tool } from 'sanity'

import { ProductCreator } from '../components/products/productManager/ProductCreator'
import { ITSContext } from '../types'

export function createTools(ctx: ITSContext): Tool[] {
  const tools: Tool[] = []
  if (ctx.featureRegistry.isFeatureEnabled('shop')) {
    const productCreator: Tool = {
      name: ctx.componentT.default('productCreatorTool.name'),
      title: ctx.componentT.default('productCreatorTool.title'),
      // icon: WineIcon,
      component: ProductCreator,
    }
    tools.push(productCreator)
  }

  return tools
}
