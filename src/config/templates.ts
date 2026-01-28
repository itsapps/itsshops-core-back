import { ITSFeatureRegistry } from '../types'
import { Template } from 'sanity'


export function templateResolver (prev: Template[], registry: ITSFeatureRegistry) {
  const templates = []
  if (registry.isDocEnabled('category')) {
    const category2Child: Template = {
      id: 'subCategory',
      title: 'Sub-category',
      schemaType: 'category',
      parameters: [{name: `parentCategoryId`, title: `Parent Category ID`, type: `string`}],
      value: (parameters: {parentCategoryId: string}) => ({
        parent: {
          _type: `reference`,
          _ref: parameters.parentCategoryId
        }
      })
    }
    templates.push(category2Child)
  }
  const allowedDocs = registry.getEnabledDocs()
    .filter(doc => {
      return !doc.isSingleton && doc.allowCreate !== false;
    })

  const allowedDocIds = allowedDocs.map(doc => doc.name)
  return [
    ...prev.filter((template) => allowedDocIds.includes(template.schemaType)),
    ...templates,
  ]
}