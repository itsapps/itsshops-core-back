import { Checkbox, Flex, Stack, Text } from '@sanity/ui'
import { ReactElement, useCallback, useId } from 'react'

import { ChoiceGroup } from '../ProductCreator.types'

/** A labelled checkbox list (`fieldset` + `legend`), indented by `depth` (subcategories). */
export function ChoiceFieldset({
  legend,
  group,
}: {
  legend: string
  group: ChoiceGroup
}): ReactElement {
  const { options, selected, onChange } = group
  const baseId = useId()
  const toggle = useCallback(
    (id: string, checked: boolean) =>
      onChange(checked ? [...selected, id] : selected.filter((s) => s !== id)),
    [selected, onChange],
  )

  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <legend style={{ padding: 0, marginBottom: '0.75rem' }}>
        <Text size={1} weight="semibold">
          {legend}
        </Text>
      </legend>
      <Stack gap={2}>
        {options.map((option) => {
          const id = `${baseId}-${option._id}`
          return (
            <Flex
              key={option._id}
              align="center"
              gap={2}
              style={{ paddingInlineStart: `${(option.depth ?? 0) * 1.5}rem` }}
            >
              <Checkbox
                id={id}
                checked={selected.includes(option._id)}
                onChange={(e) => toggle(option._id, e.currentTarget.checked)}
              />
              <Text size={1}>
                <label htmlFor={id}>{option.title}</label>
              </Text>
            </Flex>
          )
        })}
      </Stack>
    </fieldset>
  )
}
