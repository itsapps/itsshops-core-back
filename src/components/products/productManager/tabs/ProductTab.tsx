import { Button, Flex, Stack } from '@sanity/ui'
import { ReactElement } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { MainProduct } from '../MainProduct'
import { ProductTabProps } from '../ProductCreator.types'

export function ProductTab(props: ProductTabProps): ReactElement {
  const { componentT } = useITSContext()
  return (
    <Stack space={6}>
      <MainProduct {...props.global} />

      <Stack>{props.content}</Stack>

      {/* Submit */}
      <Flex justify="flex-end">
        <Button
          tone="primary"
          text={
            props.submitting
              ? componentT.default('productCreatorTool.submitting')
              : componentT.default('productCreatorTool.submit', 'Create Product', {
                  count: props.rows,
                })
          }
          disabled={!props.canSubmit || props.submitting}
          loading={props.submitting}
          onClick={props.handleSubmit}
        />
      </Flex>
    </Stack>
  )
}
