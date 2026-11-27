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
  /** `add`: variants added to an existing product (other toast text). Default `create`. */
  mode?: 'create' | 'add'
  onError?: (err: Error) => void
}): UseProductTransactionReturn {
  const { componentT, config } = useITSContext()
  const defaultLocale = config.localization.defaultLocale
  const { titles, onError, mode = 'create' } = options
  const messages = mode === 'add' ? 'variantsAdded' : 'productCreated'
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
          `productCreatorTool.messages.${messages}.description`,
          undefined,
          { title, count },
        )
        toast.push({
          status: 'success',
          title: componentT.default(`productCreatorTool.messages.${messages}.title`),
          description: link ? (
            // The toast shrink-wraps its content to the text, so `width: 100%` alone stays narrow.
            // Its inner width per @sanity/ui: layer `min(420px, 100vw)` − 2 × 20px layer padding
            // − 2 × 12px content padding − 2 × 1px border = 66px less
            <Stack gap={2} style={{ minWidth: 'calc(min(420px, 100vw) - 66px)' }}>
              <Text size={1}>{text}</Text>
              <Button
                style={{ width: '100%' }}
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
    [titles, defaultLocale, messages, toast, componentT, onError, router],
  )

  return { submitting, commitTransaction }
}
