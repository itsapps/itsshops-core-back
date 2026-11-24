import { Flex, Text } from '@sanity/ui'
import { ReactElement } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { VariantSectionHeaderProps } from '../ProductCreator.types'
import { SectionLabel } from './SectionLabel'

export function VariantSectionHeader(props: VariantSectionHeaderProps): ReactElement {
  const { componentT } = useITSContext()
  const { count } = props
  return (
    <Flex align="center" justify="space-between">
      <SectionLabel>
        {componentT.default('productCreatorTool.sections.variants.title')}
      </SectionLabel>
      <Text size={1} muted>
        {componentT.default('productCreatorTool.sections.variants.count', `${count} variants`, {
          count: count,
        })}
      </Text>
    </Flex>
  )
}
