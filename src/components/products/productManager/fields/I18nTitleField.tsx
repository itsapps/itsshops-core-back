import { Box, Checkbox, Flex, Label, Stack, Text, TextInput } from '@sanity/ui'
import { ChangeEvent, ReactElement } from 'react'
import { memo, useCallback, useId, useState } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { I18nTitleInputsProps, LocaleTitleInputProps } from '../ProductCreator.types'
import { LabelField } from './Label'

const LocaleTitleInput = memo(function LocaleTitleInput(props: LocaleTitleInputProps) {
  const { locale, required = false, value, onChange, placeholder, hint, action } = props
  const generatedId = useId()
  const id = props.id ?? generatedId
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(locale, e.currentTarget.value),
    [locale, onChange],
  )
  const hintId = useId()

  return (
    <LabelField id={id} title={locale.toUpperCase()} required={required}>
      <Stack gap={2}>
        <Flex align="center" gap={2}>
          <Box flex={1}>
            <TextInput
              id={id}
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              aria-describedby={hint ? hintId : undefined}
            />
          </Box>
          {action}
        </Flex>
        {hint && (
          <Text id={hintId} size={1} muted>
            {hint}
          </Text>
        )}
      </Stack>
    </LabelField>
  )
})

export function I18nTitleInputs(props: I18nTitleInputsProps): ReactElement {
  const { locales, defaultLocale, requiredLocales, required, titles, onChange, placeholder } = props
  const { hint, action, defaultInputId } = props
  const { schemaT } = useITSContext()
  const [expanded, setExpanded] = useState(required || titles.some((t) => t.value))
  const toggleId = useId()

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
    <Stack gap={2}>
      <Flex align="center" gap={3}>
        {!required && <Checkbox id={toggleId} checked={expanded} onChange={handleToggle} />}
        {/* Without the toggle there is no single control to label (each locale input has its own) */}
        {required ? (
          <Label size={1}>{`${schemaT.default('fields.title.title')} *`}</Label>
        ) : (
          <Label as="label" htmlFor={toggleId} size={1}>
            {schemaT.default('fields.title.title')}
          </Label>
        )}
      </Flex>

      {expanded && (
        <Stack gap={3}>
          {locales.map((locale) => (
            <LocaleTitleInput
              key={locale}
              locale={locale}
              required={requiredLocales.includes(locale)}
              value={titles.find((t) => t.locale === locale)?.value ?? ''}
              onChange={handleChange}
              placeholder={placeholder}
              hint={locale === defaultLocale ? hint : undefined}
              action={locale === defaultLocale ? action : undefined}
              id={locale === defaultLocale ? defaultInputId : undefined}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
