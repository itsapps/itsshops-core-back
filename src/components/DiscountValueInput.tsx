import React from 'react'
import { NumberInputProps, useFormValue } from 'sanity'

import { PriceInput } from './PriceInput'

/**
 * Discount `value`: a fixed amount is entered in euros (`PriceInput`, stored as cents), a percent
 * as a plain number. Reads the sibling `valueType`; the stored value is the same either way.
 */
export const DiscountValueInput = (props: NumberInputProps): React.ReactElement => {
  const valueType = useFormValue([...props.path.slice(0, -1), 'valueType'])
  return valueType === 'fixed' ? <PriceInput {...props} /> : props.renderDefault(props)
}
