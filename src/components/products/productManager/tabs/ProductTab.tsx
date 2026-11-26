import { Button, Flex, Stack, Text } from '@sanity/ui'
import { ReactElement, useId } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { MainProduct } from '../MainProduct'
import { ProductTabProps } from '../ProductCreator.types'

export function ProductTab(props: ProductTabProps): ReactElement {
  const { componentT } = useITSContext()
  const { submitCheck, submitting } = props
  const reasonsId = useId()
  const blocked = !submitCheck.ok && submitCheck.reasons.length > 0
  // Creating vs. adding to an existing product; the wine tab says "Wein" / "Jahrgang & Flasche"
  const adding = !!props.hideProductSection
  const wine = props.global.kind === 'wine'
  const submitKey = {
    create: { wine: 'submitWine', other: 'submit' },
    add: { wine: 'submitAddWine', other: 'submitAdd' },
  }[adding ? 'add' : 'create'][wine ? 'wine' : 'other']

  return (
    <Stack gap={[1, 1, 4, 6]}>
      {!props.hideProductSection && <MainProduct {...props.global} />}

      <Stack>{props.content}</Stack>

      {/* Submit — stays focusable while blocked (aria-disabled), the reasons describe why */}
      <Flex direction="column" align="flex-end" gap={3} marginBottom={4}>
        {blocked && (
          <Stack
            as="ul"
            id={reasonsId}
            gap={2}
            aria-label={componentT.default('productCreatorTool.reasons.label')}
            style={{ margin: 0, padding: 0, listStyle: 'none', textAlign: 'end' }}
          >
            {submitCheck.reasons.map((reason, i) => (
              // eslint-disable-next-line react/no-array-index-key -- static list, labels may repeat
              <Text as="li" key={i} size={1} muted>
                {reason}
              </Text>
            ))}
          </Stack>
        )}
        <Button
          tone="primary"
          text={
            submitting
              ? componentT.default(
                  adding ? 'productCreatorTool.submittingAdd' : 'productCreatorTool.submitting',
                )
              : componentT.default(`productCreatorTool.${submitKey}`, undefined, {
                  count: props.rows,
                })
          }
          aria-disabled={!submitCheck.ok || undefined}
          aria-describedby={blocked ? reasonsId : undefined}
          style={submitCheck.ok ? undefined : { opacity: 0.5, cursor: 'not-allowed' }}
          disabled={submitting}
          loading={submitting}
          onClick={props.handleSubmit}
        />
      </Flex>
    </Stack>
  )
}
