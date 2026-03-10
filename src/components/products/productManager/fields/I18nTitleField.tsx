import { Checkbox, Flex, Label, Stack, TextInput } from '@sanity/ui'
import { ChangeEvent, ReactElement } from 'react'
import { memo, useCallback, useState } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { I18nTitleInputsProps, LocaleTitleInputProps } from '../ProductCreator.types'
import { LabelField } from './Label'

const LocaleTitleInput = memo(function LocaleTitleInput(props: LocaleTitleInputProps) {
  const { locale, required = false, value, onChange, placeholder } = props
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(locale, e.currentTarget.value),
    [locale, onChange],
  )

  return (
    <LabelField title={locale.toUpperCase()} required={required}>
      <TextInput value={value} onChange={handleChange} placeholder={placeholder} />
    </LabelField>
  )
})

export function I18nTitleInputs(props: I18nTitleInputsProps): ReactElement {
  const { locales, requiredLocales, required, titles, onChange, placeholder } = props
  const { schemaT } = useITSContext()
  const [expanded, setExpanded] = useState(required || titles.some((t) => t.value))

  const handleToggle = useCallback(() => {
    setExpanded((prev) => {
      if (prev) onChange([]) // clear titles when collapsing
      return !prev
    })
  }, [onChange])

  const handleChange = useCallback(
    (locale: string, value: string) => {
      const existing = titles.find((title) => title.locale === locale)
      if (existing) {
        onChange(
          titles.map((title) => {
            return title.locale === locale ? { ...title, value } : title
          }),
        )
      } else {
        onChange([...titles, { locale, value }])
      }
    },
    [titles, onChange],
  )

  return (
    <Stack space={2}>
      <Flex align="center" gap={3}>
        {!required && <Checkbox checked={expanded} onChange={handleToggle} />}
        <Label size={1}>{`${schemaT.default('fields.title.title')}${required ? ' *' : ''}`}</Label>
      </Flex>

      {expanded && (
        <Stack space={3}>
          {locales.map((locale) => (
            <LocaleTitleInput
              key={locale}
              locale={locale}
              required={requiredLocales.includes(locale)}
              value={titles.find((t) => t.locale === locale)?.value ?? ''}
              onChange={handleChange}
              placeholder={placeholder}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
