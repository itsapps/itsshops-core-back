import { Card, Text } from '@sanity/ui'
import type { UserComponent } from 'sanity/structure'

import { useITSContext } from '../../context/ITSCoreProvider'

/**
 * Shown instead of a product's list (product + variants) once the product is gone (deleted, or a
 * new product's draft discarded): the list's product item would otherwise stay as a "Missing
 * document" whose editor creates a new product with the old id.
 */
export const ProductDeletedPane: UserComponent = () => {
  const { structureT } = useITSContext()
  return (
    <Card padding={4}>
      <Card padding={3} radius={2} tone="caution" border>
        <Text size={1}>{structureT.default('products.deleted')}</Text>
      </Card>
    </Card>
  )
}
