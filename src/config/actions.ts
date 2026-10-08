import { DocumentActionComponent, DocumentActionsContext } from 'sanity'
import {
  createCustomDocumentAction,
  type CustomDocumentAction,
} from '../components/actions/CustomDocumentAction'
import { OrderDocumentAction } from '../components/actions/OrderActions'
import { OrderMailDocumentAction } from '../components/actions/OrderMailAction'
import {
  OrderWithdrawalCreateAction,
  WithdrawalResendAction,
  WithdrawalResolveAction,
} from '../components/actions/WithdrawalActions'
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
    actions.push(OrderWithdrawalCreateAction)
  }
  if (context.schemaType === 'orderWithdrawal') {
    actions.push(WithdrawalResolveAction)
    actions.push(WithdrawalResendAction)
    // Delete is disallowed in the schema (a matched withdrawal is a legal record) and
    // re-added here for unmatched declarations only (junk / non-customers' data).
    const action = !ctx.config.isDev && prev.find((props) => props.action === 'delete')
    if (action) {
      actions.push(
        createCustomAction<string | null>({
          action,
          query: `*[_id == $id][0].status`,
          validateFn: (status) =>
            status === 'unmatched' ? true : 'actions.orderWithdrawal.deleteOnlyUnmatched',
        }),
      )
    }
  }
  if (isEnabledSchema(context.schemaType, 'product', 'shop')) {
    actions.push(AddVariantsAction)
  }
  // category: plain delete is disallowed in the schema and re-added here — guarded
  // (blocks deleting a parent) when subcategories are enabled, plain otherwise.
  if (isEnabledSchema(context.schemaType, 'category', 'shop.category') && !ctx.config.isDev) {
    const action = prev.find((props) => props.action === 'delete')
    if (action) {
      if (registry.isFeatureEnabled('shop.category.subcategories')) {
        const query = `count(*[_type == "category" && parent._ref == $id]) > 0`
        actions.push(
          createCustomAction<boolean>({
            action,
            query,
            validateFn: (result) =>
              result == true ? 'categories.deleteNotAllowedSubcategoriesExist' : true,
          }),
        )
      } else {
        actions.push(action)
      }
    }
  }

  // Customer hook — add/wrap actions (e.g. withGeneratedZips). Runs last so it
  // sees the final core action set.
  return ctx.config.documentActions ? ctx.config.documentActions(actions, context) : actions
}
