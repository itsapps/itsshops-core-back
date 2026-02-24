import { Template } from 'sanity'

import { ITSLocaleContext } from '../types'

export function templateResolver(prev: Template[], ctx: ITSLocaleContext): Template[] {
  const templates: Template[] = []
  if (ctx.featureRegistry.isDocEnabled('category')) {
    const category: Template = {
      id: 'subCategory',
      title: 'Sub-category',
      schemaType: 'category',
      parameters: [{ name: `parentCategoryId`, title: `Parent Category ID`, type: `string` }],
      value: (parameters: { parentCategoryId: string }) => ({
        parent: {
          _type: `reference`,
          _ref: parameters.parentCategoryId,
        },
      }),
    }
    templates.push(category)
  }
  const allowedDocs = ctx.featureRegistry.getEnabledDocs().filter((doc) => {
    // 1. Singletons are never in the "New Document" menu
    if (doc.isSingleton) return false

    // 2. Resolve allowCreate (handle boolean, function, or undefined)
    const canCreate =
      typeof doc.allowCreate === 'function'
        ? doc.allowCreate(ctx.config.isDev)
        : doc.allowCreate !== false // Default to true if undefined

    return canCreate
  })

  const allowedDocIds = allowedDocs.map((doc) => doc.name)
  const t = [
    ...prev.filter((template) => allowedDocIds.includes(template.schemaType)),
    // ...prev.filter((template) => true),
    ...templates,
  ]
  return t
}
