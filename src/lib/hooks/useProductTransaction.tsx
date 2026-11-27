import { Transaction } from '@sanity/client'
import { useToast } from '@sanity/ui/toast'
import { useCallback, useState } from 'react'

import { I18nTitleEntry } from '../../components/products/productManager/ProductCreator.types'
import { useITSContext } from '../../context/ITSCoreProvider'

interface UseProductTransactionReturn {
  submitting: boolean
  /** Resolves `true` after a successful commit (errors are shown as a toast, not thrown). */
  commitTransaction: (tx: Transaction, count: number, onSuccess?: () => void) => Promise<boolean>
}

export function useProductTransaction(options: {
  titles: I18nTitleEntry[]
  /** `add`: variants added to an existing product (other toast text). Default `create`. */
  mode?: 'create' | 'add'
  onError?: (err: Error) => void
}): UseProductTransactionReturn {
  const { componentT, config } = useITSContext()
  const defaultLocale = config.localization.defaultLocale
  const { titles, onError, mode = 'create' } = options
  const messages = mode === 'add' ? 'variantsAdded' : 'productCreated'
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)

  const commitTransaction = useCallback(
    async (tx: Transaction, count: number, onSuccess?: () => void) => {
      setSubmitting(true)
      try {
        await tx.commit()
        const title = titles.find((t) => t.locale === defaultLocale)?.value ?? ''
        const text = componentT.default(
          `productCreatorTool.messages.${messages}.description`,
          undefined,
          { title, count },
        )
        toast.push({
          status: 'success',
          title: componentT.default(`productCreatorTool.messages.${messages}.title`),
          // Text only: the way to the product is the persistent "Zuletzt angelegt" card under
          // the submit button (a toast times out, WCAG 2.2.1, and is hard to reach by keyboard)
          description: text,
        })
        onSuccess?.()
        return true
      } catch (err: any) {
        toast.push({
          status: 'error',
          title: componentT.default('productCreatorTool.messages.productCreatedFail.title'),
          description: err.message,
        })
        onError?.(err)
        return false
      } finally {
        setSubmitting(false)
      }
    },
    [titles, defaultLocale, messages, toast, componentT, onError],
  )

  return { submitting, commitTransaction }
}
