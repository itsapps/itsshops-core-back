import { DocumentActionComponent, DocumentActionsContext } from 'sanity'
import {
  createCustomDocumentAction,
  type CustomDocumentAction,
} from '../components/actions/CustomDocumentAction'
import { OrderDocumentAction } from '../components/actions/OrderActions'
import { OrderMailDocumentAction } from '../components/actions/OrderMailAction'
import { AddVariantsAction } from '../components/products/AddVariantsAction'
import { ITSContext, ITSFeatureKey, ITSSanityDefinedAction } from '../types'

const globallyDisallowedActions: ITSSanityDefinedAction[] = ['schedule']
const singletonAllowedActions: ITSSanityDefinedAction[] = ['publish', 'discardChanges', 'restore']

export function actionResolver(
  prev: DocumentActionComponent[],
  context: DocumentActionsContext,
  ctx: ITSContext,
): DocumentActionComponent[] {
  const registry = ctx.featureRegistry
  const doc = registry.getDoc(context.schemaType)
  if (!doc) {
    return prev
  }

  if (doc.isSingleton) {
    return prev.filter(({ action }) => action && singletonAllowedActions.includes(action))
  }

  const actions = prev.filter((obj) => {
    if (ctx.config.isDev) return true

    const action = obj.action
    if (action === undefined) {
      return true
    }
    if (doc.disallowedActions) {
      return !doc.disallowedActions.includes(action)
    }
    return !globallyDisallowedActions.includes(action)
  })
  // actions.push(ImportWinesAction)

  // other actions
  const createCustomAction = <T>(customAction: Omit<CustomDocumentAction<T>, 'context'>) => {
    return createCustomDocumentAction({
      ...customAction,
      context,
    })
  }

  const isEnabledSchema = (schemaType: string, type: string, feature: ITSFeatureKey) => {
    return registry.isFeatureEnabled(feature) && schemaType === type
  }
  if (context.schemaType === 'order') {
    actions.push(OrderDocumentAction)
    actions.push(OrderMailDocumentAction)
  }
  if (isEnabledSchema(context.schemaType, 'product', 'shop')) {
    actions.push(AddVariantsAction)
  }
  if (isEnabledSchema(context.schemaType, 'category', 'shop.category.subcategories')) {
    const action = prev.find((props) => props.action === 'delete')
    if (action) {
      const query = `count(*[_type == "category" && parent._ref == $id]) > 0`
      actions.push(
        createCustomAction<boolean>({
          action,
          query,
          validateFn: (result) =>
            result == true ? 'categories.deleteNotAllowedSubcategoriesExist' : true,
        }),
      )
    }
  }

  return actions
}
