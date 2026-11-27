import { Button, Flex, Stack, Text } from '@sanity/ui'
import { ReactElement, useId } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { MainProduct } from '../MainProduct'
import { ProductTabProps } from '../ProductCreator.types'

export function ProductTab(props: ProductTabProps): ReactElement {
  const { componentT, format } = useITSContext()
  const { submitCheck, submitting, summaryLines } = props
  const reasonsId = useId()
  const blocked = !submitCheck.ok && submitCheck.reasons.length > 0
  // Creating vs. adding to an existing product; the wine tab says "Wein" / "Jahrgang & Flasche"
  const adding = !!props.hideProductSection
  const wine = props.global.kind === 'wine'
  const submitKey = {
    create: { wine: 'submitWine', other: 'submit' },
    add: { wine: 'submitAddWine', other: 'submitAdd' },
  }[adding ? 'add' : 'create'][wine ? 'wine' : 'other']

  // Summary: only the count line is a live region (the list would be noise on every keystroke)
  const count = summaryLines.length
  const { defaultLocale, titles } = props.global
  const productTitle = titles.find((t) => t.locale === defaultLocale)?.value ?? ''
  let countLine = ''
  if (count > 0) {
    countLine = adding
      ? componentT.default('productCreatorTool.summary.add', undefined, {
          count,
          title: productTitle,
        })
      : componentT.default(
          wine ? 'productCreatorTool.summary.createWine' : 'productCreatorTool.summary.create',
          undefined,
          { count },
        )
  }

  return (
    <Stack gap={[1, 1, 4, 6]}>
      {!props.hideProductSection && <MainProduct {...props.global} />}

      <Stack>{props.content}</Stack>

      {/* Submit — stays focusable while blocked (aria-disabled), the reasons describe why */}
      <Flex direction="column" align="flex-end" gap={3} marginBottom={4}>
        <Stack gap={2} style={{ textAlign: 'end' }}>
          <div role="status">
            <Text size={1} weight="semibold">
              {countLine}
            </Text>
          </div>
          {count > 0 && (
            <Stack
              as="ul"
              gap={2}
              aria-label={componentT.default('productCreatorTool.summary.label')}
              style={{ margin: 0, padding: 0, listStyle: 'none' }}
            >
              {summaryLines.map((line) => (
                <Text as="li" key={line.key} size={1} muted>
                  {[
                    line.label,
                    line.price
                      ? format.currency(line.price / 100)
                      : componentT.default('productCreatorTool.summary.noPrice'),
                    line.status === 'comingSoon'
                      ? componentT.default('productCreatorTool.summary.comingSoon')
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              ))}
            </Stack>
          )}
        </Stack>
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
