import { Label, Select, Stack } from '@sanity/ui'
import { ChangeEvent, ReactElement } from 'react'
import { useCallback } from 'react'

import { useITSContext } from '../../../context/ITSCoreProvider'
import { TaxCategoryFieldProps } from './ProductCreator.types'

export function TaxCategoryField(props: TaxCategoryFieldProps): ReactElement {
  const { value, taxCategories, loadingTax, onTaxChange } = props
  const { schemaT } = useITSContext()
  const handleTaxChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => onTaxChange(e.currentTarget.value),
    [onTaxChange],
  )

  return (
    <Stack space={2}>
      <Label size={1}>{schemaT.default('taxCategory.title')}</Label>
      <Select value={value} onChange={handleTaxChange} disabled={loadingTax}>
        <option value="">-</option>
        {taxCategories.map((tc) => (
          <option key={tc._id} value={tc._id}>
            {tc.title} ({tc.code})
          </option>
        ))}
      </Select>
    </Stack>
  )
}
