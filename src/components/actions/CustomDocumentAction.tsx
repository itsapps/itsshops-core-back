import { useITSContext } from '../../context/ITSCoreProvider'

import {
  DocumentActionComponent,
  DocumentActionProps,
  SanityClient,
} from 'sanity'
import {useToast} from '@sanity/ui'

export type CustomDocumentAction = {
  action: DocumentActionComponent,
  client: SanityClient,
  query: string,
  validateFn: (queryResult: any, id: string) => string | true,
  allowActionFn?: (props: DocumentActionProps) => string | true,
  shouldValidateFn?: (props: DocumentActionProps) => boolean,
}
export function createCustomDocumentAction({
  action,
  client,
  query,
  validateFn,
  allowActionFn,
  shouldValidateFn,
}: CustomDocumentAction) {
  const DocumentAction = (props: DocumentActionProps) => {
    const originalResult = action(props)
    const toast = useToast()
    const {t} = useITSContext()

    return {
      ...originalResult,
      label: originalResult?.label || t('actions.delete'),
      onHandle: async () => {
        // optionally check if action is allowed in callback fn
        if (allowActionFn) {
          const allow = allowActionFn(props)
          if (typeof allow === 'string') {
            toast.push({
              status: 'error',
              title: t(allow),
            });
            return
          }
        }

        // optionally check if action should be validated
        if (shouldValidateFn && !shouldValidateFn(props)) {
          originalResult?.onHandle?.()
          return
        }

        // validate
        const response = await client.fetch(query, {id: props.id})
        const validate = validateFn(response, props.id)
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