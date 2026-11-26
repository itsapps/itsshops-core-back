import { Select, Stack, Text } from '@sanity/ui'
import { ChangeEvent, ReactElement } from 'react'
import { useCallback, useId } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { TaxCategoryFieldProps } from '../ProductCreator.types'
import { LabelField } from './Label'

export function TaxCategoryField(props: TaxCategoryFieldProps): ReactElement {
  const {
    value,
    taxCategories,
    loadingTax,
    onTaxChange,
    required = false,
    hint,
    inheritedLabel,
  } = props
  const { schemaT } = useITSContext()
  const id = useId()
  const hintId = useId()
  const handleTaxChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => onTaxChange(e.currentTarget.value),
    [onTaxChange],
  )

  return (
    <LabelField id={id} title={schemaT.default('taxCategory.title')} required={required}>
      <Stack gap={2}>
        <Select
          id={id}
          value={value}
          onChange={handleTaxChange}
          disabled={loadingTax}
          aria-describedby={hint ? hintId : undefined}
        >
          {/* Empty = not written: the variant inherits (the label says from where) */}
          <option value="">{inheritedLabel ?? '-'}</option>
          {taxCategories.map((tc) => (
            <option key={tc._id} value={tc._id}>
              {tc.title} ({tc.code})
            </option>
          ))}
        </Select>
        {hint && (
          <Text id={hintId} size={1} muted>
            {hint}
          </Text>
        )}
      </Stack>
    </LabelField>
  )
}
