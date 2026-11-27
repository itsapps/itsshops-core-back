import { type ReactElement } from 'react'
import { type FieldProps, useFormValue } from 'sanity'

import { useITSContext } from '../../context/ITSCoreProvider'
import { type InheritSpec, isSet, variantHint } from '../../utils/inheritance'
import { useInheritedProduct } from './useInheritedProduct'

/**
 * Hint of an inheritable variant field (`builders.inherited`, rendered by `InheritanceField`): appends one sentence
 * to the field's static description saying what the variant uses now — "Vom Produkt: 14,90 €",
 * "Eigener Wert — Produkt: …", plus "(Entwurf am Produkt: …)" when the product's draft differs.
 * The description is a string (Sanity's `BaseFieldProps.description`) and lands in the
 * `desc_<id>` node the input's `aria-describedby` points at — Sanity only renders that link when
 * the schema field has a static description, which every wrapped field has (fields_*.ts).
 */
export function InheritedField(props: FieldProps & { spec: InheritSpec }): ReactElement {
  const { localizer, format, componentT } = useITSContext()
  const product = useInheritedProduct()
  const ownPrice = useFormValue(['price'])
  const { spec, ...fieldProps } = props

  if (!product) return props.renderDefault(fieldProps)

  const field = spec.field ?? props.name
  const hint = variantHint(
    {
      spec,
      own: props.value,
      field,
      published: product.published,
      draft: product.draft,
      shopDefaultTax: product.shopDefaultTax,
      variantHasOwnPrice: isSet('number', ownPrice),
    },
    { localizer, format, t: componentT.default },
  )
  const description = [props.description, hint].filter(Boolean).join(' ')
  return props.renderDefault({ ...fieldProps, description })
}
