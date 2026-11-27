import { Box, Stack, Text } from '@sanity/ui'
import { type ReactElement } from 'react'
import { type FieldProps, useFormValue } from 'sanity'
import { IntentLink } from 'sanity/router'

import { useITSContext } from '../../context/ITSCoreProvider'
import {
  appliesTo,
  type InheritSpec,
  overrideSentence,
  overridesProduct,
} from '../../utils/inheritance'
import { variantDetails } from '../../utils/variantLabel'
import { useOverridingVariants } from './useOverridingVariants'

/**
 * Hint of an inheritable product field (`builders.inheritedBy`, rendered by `InheritanceField`): appends
 * "Eigener Wert in 2 von 5 Varianten." to the static description (announced with the input) and
 * lists those variants as links below the input. Nothing extra when no variant overrides it.
 * Uses the same `isSet` as `InheritedField`, so both sides agree.
 */
export function OverriddenByVariants(props: FieldProps & { spec: InheritSpec }): ReactElement {
  const { localizer, format, componentT } = useITSContext()
  const t = componentT.default
  const id = (useFormValue(['_id']) as string | undefined)?.replace(/^drafts\./, '')
  const rows = useOverridingVariants(id)
  const { spec, ...fieldProps } = props

  if (!rows) return props.renderDefault(fieldProps)

  const field = spec.field ?? props.name
  const applicable = rows.filter((row) => appliesTo(spec, row.kind))
  const overriding = applicable.filter((row) => overridesProduct(spec, field, row))
  if (overriding.length === 0) return props.renderDefault(fieldProps)

  const sentence = overrideSentence(overriding.length, applicable.length, t)
  const description = [props.description, sentence].filter(Boolean).join(' ')

  const label = (row: (typeof overriding)[number]) => {
    const name = [
      localizer.value<string>(row.title),
      variantDetails(
        { localizer, format },
        {
          kind: row.kind,
          wineVolume: row.wineVolume,
          wineVintage: row.wineVintage,
          optionTitles: row.optionTitles,
        },
      ),
    ]
      .filter(Boolean)
      .join(' — ')
    const base =
      name ||
      t('inheritance.unnamedVariant', `Variant ${rows.indexOf(row) + 1}`, {
        n: rows.indexOf(row) + 1,
      })
    return row.isDraft ? `${base}${t('inheritance.draftSuffix', ' (draft)')}` : base
  }

  return (
    <Stack gap={3}>
      {props.renderDefault({ ...fieldProps, description })}
      <Stack
        as="ul"
        gap={2}
        aria-label={t('inheritance.product.listLabel', 'Variants with an own value')}
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
      >
        {overriding.map((row) => (
          <Box as="li" key={row._id}>
            <Text size={1}>
              <IntentLink
                intent="edit"
                params={{ id: row._id.replace(/^drafts\./, ''), type: 'productVariant' }}
              >
                {label(row)}
              </IntentLink>
            </Text>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}
