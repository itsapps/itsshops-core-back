import { Transaction } from '@sanity/client'
import { Button, Stack, Text } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { useCallback, useState } from 'react'
import { useRouter } from 'sanity/router'

import { I18nTitleEntry } from '../../components/products/productManager/ProductCreator.types'
import { useITSContext } from '../../context/ITSCoreProvider'

/** The created product, for an "open product" button in the success toast. */
export interface ProductLink {
  documentId: string
  documentType: 'product'
}

interface UseProductTransactionReturn {
  submitting: boolean
  /** Resolves `true` after a successful commit (errors are shown as a toast, not thrown). */
  commitTransaction: (
    tx: Transaction,
    count: number,
    onSuccess?: () => void,
    link?: ProductLink,
  ) => Promise<boolean>
}

export function useProductTransaction(options: {
  titles: I18nTitleEntry[]
  onError?: (err: Error) => void
}): UseProductTransactionReturn {
  const { componentT, config } = useITSContext()
  const defaultLocale = config.localization.defaultLocale
  const { titles, onError } = options
  const toast = useToast()
  // Captured here (router context): the toast renders in a portal outside it, so the button
  // navigates with this router instead of an IntentLink.
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const commitTransaction = useCallback(
    async (tx: Transaction, count: number, onSuccess?: () => void, link?: ProductLink) => {
      setSubmitting(true)
      try {
        await tx.commit()
        const title = titles.find((t) => t.locale === defaultLocale)?.value ?? ''
        const text = componentT.default(
          'productCreatorTool.messages.productCreated.description',
          'Product created',
          { title, count },
        )
        toast.push({
          status: 'success',
          title: componentT.default('productCreatorTool.messages.productCreated.title'),
          description: link ? (
            <Stack gap={2}>
              <Text size={1}>{text}</Text>
              <Button
                mode="ghost"
                text={componentT.default('productCreatorTool.messages.productCreated.open')}
                onClick={() =>
                  router.navigateIntent('edit', { id: link.documentId, type: link.documentType })
                }
              />
            </Stack>
          ) : (
            text
          ),
          ...(link && { duration: 10000 }),
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
    [titles, defaultLocale, toast, componentT, onError, router],
  )

  return { submitting, commitTransaction }
}
