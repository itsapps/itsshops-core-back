import React from 'react'
import { Card, Stack, Text, Box, Code, Flex, Badge } from '@sanity/ui'
import { WarningCircle } from 'phosphor-react'
import { type ZodError, z } from 'zod'

interface OrderDataErrorProps {
  error: ZodError
  isDev?: boolean
}

export function OrderDataError({ error, isDev = false }: OrderDataErrorProps) {
  // Flattening the error makes it much easier to read than the raw JSON
  // const fieldErrors = error.flatten().fieldErrors
  const treeErrors = z.treeifyError(error);
  
  // We can still extract the top-level keys for the summary badges
  const errorKeys = Object.keys(treeErrors);

  return (
    <Box padding={4}>
      <Card 
        padding={4} 
        radius={3} 
        tone="caution" 
        shadow={1} 
        border
      >
        <Stack space={4}>
          <Flex align="center" gap={3}>
            <WarningCircle size={24} weight="bold" />
            <Text weight="bold" size={2}>
              Order Data Inconsistent
            </Text>
          </Flex>

          <Text size={1} muted>
            This record is missing required system information. The preview cannot be generated until the fields below are corrected.
          </Text>

          {/* Admin-Friendly Summary */}
          <Stack space={2}>
            {errorKeys.map((field) => (
              <Badge key={field} tone="critical" style={{ width: 'fit-content' }}>
                Missing Field: {field}
              </Badge>
            ))}
          </Stack>

          {/* Dev-Only Technical Trace */}
          {isDev && (
            <Stack space={3} style={{ marginTop: '1rem' }}>
              <Text size={0} weight="bold" muted>
                Developer Trace (Zod)
              </Text>
              <Card padding={3} tone="transparent" border radius={2} overflow="auto">
                <Code size={1} language="json">
                  {JSON.stringify(treeErrors, null, 2)}
                </Code>
              </Card>
            </Stack>
          )}
        </Stack>
      </Card>
    </Box>
  )
}