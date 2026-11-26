import { Card, Text } from '@sanity/ui'
import type { UserComponent } from 'sanity/structure'

import { useITSContext } from '../../context/ITSCoreProvider'
import { AddVariantsDialog } from './AddVariantsAction'

export const AddVariantsPane: UserComponent = ({ options }) => {
  const { componentT } = useITSContext()
  const productId = typeof options?.productId === 'string' ? options.productId : null
  if (!productId) {
    return (
      <Card padding={4} tone="critical">
        <Text size={1}>{componentT.default('productCreatorTool.errors.missingProductId')}</Text>
      </Card>
    )
  }
  return (
    <Card padding={4}>
      <AddVariantsDialog productId={productId} onClose={() => {}} variant="pane" />
    </Card>
  )
}
