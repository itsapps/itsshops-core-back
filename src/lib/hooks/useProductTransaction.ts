import { Transaction } from '@sanity/client'
import { useToast } from '@sanity/ui'
import { useCallback, useState } from 'react'

import { I18nTitleEntry } from '../../components/products/productManager/ProductCreator.types'
import { useITSContext } from '../../context/ITSCoreProvider'

interface UseProductTransactionReturn {
  submitting: boolean
  commitTransaction: (tx: Transaction, count: number, onSuccess?: () => void) => Promise<void>
}

export function useProductTransaction(options: {
  titles: I18nTitleEntry[]
  onError?: (err: Error) => void
}): UseProductTransactionReturn {
  const { componentT, config } = useITSContext()
  const defaultLocale = config.localization.defaultLocale
  const { titles, onError } = options
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)

  const commitTransaction = useCallback(
    async (tx: Transaction, count: number, onSuccess?: () => void) => {
      setSubmitting(true)
      try {
        await tx.commit()
        const title = titles.find((t) => t.locale === defaultLocale)?.value ?? ''
        toast.push({
          status: 'success',
          title: componentT.default('productCreatorTool.messages.productCreated.title'),
          description: componentT.default(
            'productCreatorTool.messages.productCreated.description',
            'Product created',
            { title, count },
          ),
        })
        onSuccess?.()
      } catch (err: any) {
        toast.push({
          status: 'error',
          title: componentT.default('productCreatorTool.messages.productCreatedFail.title'),
          description: err.message,
        })
        onError?.(err)
      } finally {
        setSubmitting(false)
      }
    },
    [titles, defaultLocale, toast, componentT, onError],
  )

  return { submitting, commitTransaction }
}
