import { DocumentActionComponent, DocumentActionsContext } from 'sanity'
import { ITSFeatureRegistry, SanityDefinedAction } from '../types'

const globallyDisallowedActions: SanityDefinedAction[] = ['schedule']
const singletonAllowedActions: SanityDefinedAction[] = ["publish", "discardChanges", "restore"]

export function actionResolver (prev: DocumentActionComponent[], context: DocumentActionsContext, registry: ITSFeatureRegistry) {
  const doc = registry.get(context.schemaType)
  if (!doc) {
    return prev
  }

  if (doc.isSingleton) {
    return prev.filter(({ action }) => action && singletonAllowedActions.includes(action))
  }

  const actions = prev.filter((obj) => {
    const action = obj.action;
    if (action === undefined) {
      return true
    }
    if (doc.disallowedActions) {
      return !doc.disallowedActions.includes(action)
    }
    return !globallyDisallowedActions.includes(action)
  })

  // if (context.schemaType === 'order') {
  //   actions.push(OrderDocumentActions)
  //   actions.push(OrderMailAction)
  // }
  // else if (context.schemaType === 'variantOptionGroup') {
  //   const action = prev.find(({ action }) => action === 'delete')
  //   if (action) {
  //     const query = `count(*[_type == "variantOptionGroup" && _id == $id && defined(options) && count(options) > 0]) > 0`
  //     actions.push(createCustomDocumentAction({
  //       action,
  //       context,
  //       query,
  //       validateFn: (result) => result == true ? 'optionsGroups.groupDeleteNotAllowedOptionsExist' : true,
  //     }))
  //   }
  // }
  // else if (context.schemaType === 'category') {
  //   const action = prev.find(({ action }) => action === 'delete')
  //   if (action) {
  //     const query = `count(*[_type == "category" && parent._ref == $id]) > 0`
  //     actions.push(createCustomDocumentAction({
  //       action,
  //       context,
  //       query,
  //       validateFn: (result) => result == true ? 'categories.deleteNotAllowedSubcategoriesExist' : true,
  //     }))
  //   }
  // }
  // else if (context.schemaType === 'product') {
  //   const action = prev.find(({ action }) => action === 'delete')
  //   if (action) {
  //     const query = `count(*[_type == "product" && _id == $id && defined(variants) && count(variants) > 0]) > 0`
  //     actions.push(createCustomDocumentAction({
  //       action,
  //       context,
  //       query,
  //       validateFn: (result) => result == true ? 'product.deleteNotAllowedVariantsExist' : true,
  //     }))
  //   }
  // }
  // else if (context.schemaType === 'productVariant') {
  //   const action = prev.find(({ action }) => action === 'publish')
  //   if (action) {
  //     // disallow publishing if variant.active will change to false, but is referenced by documents (except product.variants)
  //     const query = `*[references($id)]`
  //     const publish = createCustomDocumentAction({
  //       action,
  //       context,
  //       query,
  //       validateFn: (result, variantId) => {
  //         const filtered = result.filter(doc => {
  //           if (doc._type !== 'product') return true

  //           // product references variant ONLY via variants[]
  //           const variantRefs = doc.variants?.some(v => v._ref === variantId)
  //           return !variantRefs
  //         })
  //         return filtered.length > 0 ? 'productVariant.setInactiveNotAllowedReferencesExist' : true
  //       },
  //       shouldValidateFn: (props) => props.draft?.active === false,
  //       allowActionFn: (props) => props.published === null ? 'productVariant.publishNotAllowedButByGenerating' : true,
  //     })
  //     // put action at first position in actions array
  //     actions.splice(0, 0, publish)
  //   }
  // }
  
  return actions
}