import { Box, Flex } from '@sanity/ui'
import { ReactElement } from 'react'
import { ToolMenuProps } from 'sanity'

import { useITSContext } from '../context/ITSCoreProvider'
import { DeployDialog } from './DeployDialog'
import { CreateProductFromWines } from './products/CreateProductFromWines'

export function CustomToolbar(props: ToolMenuProps): ReactElement {
  const { tools, renderDefault } = props
  const ctx = useITSContext()
  const availableTools = ctx.config.isDev ? tools : tools.filter((tool) => tool.name !== 'vision')

  return (
    <Flex
      direction={['column', 'column', 'column', 'row']}
      align={['stretch', 'stretch', 'stretch', 'center']}
      justify="space-between"
    >
      <Box flex={1}>{renderDefault({ ...props, tools: availableTools })}</Box>
      <Box>
        <Flex padding={1} gap={2} align={'center'}>
          <DeployDialog />
          <CreateProductFromWines />
        </Flex>
      </Box>
    </Flex>
  )
}
