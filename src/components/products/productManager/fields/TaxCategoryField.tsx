import { Select } from '@sanity/ui'
import { ChangeEvent, ReactElement } from 'react'
import { useCallback } from 'react'

import { useITSContext } from '../../../../context/ITSCoreProvider'
import { TaxCategoryFieldProps } from '../ProductCreator.types'
import { LabelField } from './Label'

export function TaxCategoryField(props: TaxCategoryFieldProps): ReactElement {
  const { value, taxCategories, loadingTax, onTaxChange, required = false } = props
  const { schemaT } = useITSContext()
  const handleTaxChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => onTaxChange(e.currentTarget.value),
    [onTaxChange],
  )

  return (
    <LabelField title={schemaT.default('taxCategory.title')} required={required}>
      <Select value={value} onChange={handleTaxChange} disabled={loadingTax}>
        <option value="">-</option>
        {taxCategories.map((tc) => (
          <option key={tc._id} value={tc._id}>
            {tc.title} ({tc.code})
          </option>
        ))}
      </Select>
    </LabelField>
  )
}
