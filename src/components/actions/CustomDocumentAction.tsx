import { useITSContext } from '../../context/ITSCoreProvider'

import {
  DocumentActionComponent,
  DocumentActionsContext,
  DocumentActionProps,
} from 'sanity'
import {useToast} from '@sanity/ui'

export type CustomDocumentAction<T> = {
  action: DocumentActionComponent,
  context: DocumentActionsContext,
  query: string,
  validateFn: (queryResult: T, id: string) => string | true,
  allowActionFn?: (props: DocumentActionProps) => string | true,
  shouldValidateFn?: (props: DocumentActionProps) => boolean,
}
export function createCustomDocumentAction<T>(customAction: CustomDocumentAction<T>) {
  const DocumentAction = (props: DocumentActionProps) => {
    const originalResult = customAction.action(props)
    const toast = useToast()
    const {t, sanityClient} = useITSContext()

    return {
      ...originalResult,
      label: originalResult?.label || t('actions.delete'),
      onHandle: async () => {
        // optionally check if action is allowed in callback fn
        if (customAction.allowActionFn) {
          const allow = customAction.allowActionFn(props)
          if (typeof allow === 'string') {
            toast.push({
              status: 'error',
              title: t(allow),
            });
            return
          }
        }

        // optionally check if action should be validated
        if (customAction.shouldValidateFn && !customAction.shouldValidateFn(props)) {
          originalResult?.onHandle?.()
          return
        }

        // validate
        const response = await sanityClient.fetch<T>(customAction.query, {id: props.id})
        const validate = customAction.validateFn(response, props.id)
        if (typeof validate === 'string') {
          toast.push({
            status: 'error',
            title: t(validate),
          });
          return
        }
        originalResult?.onHandle?.()
      },
    }
  }
  return DocumentAction
}