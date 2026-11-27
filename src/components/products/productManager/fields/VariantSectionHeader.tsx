import { Text } from '@sanity/ui'
import { ReactElement } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { VariantSectionHeaderProps } from '../ProductCreator.types'
import { SectionHeading } from './SectionHeading'

/** The variants section's heading (`h2`) with the variant count. */
export function VariantSectionHeader(props: VariantSectionHeaderProps): ReactElement {
  const { componentT } = useITSContext()
  const { count, title, description } = props
  return (
    <SectionHeading
      title={title ?? componentT.default('productCreatorTool.sections.variants.title')}
      description={description}
      aside={
        <Text size={1} muted>
          {componentT.default('productCreatorTool.sections.variants.count', undefined, { count })}
        </Text>
      }
    />
  )
}
