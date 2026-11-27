import { type ReactElement } from 'react'
import { type FieldProps } from 'sanity'

import type { InheritSpec } from '../../utils/inheritance'
import { InheritedField } from './InheritedField'
import { OverriddenByVariants } from './OverriddenByVariants'

/**
 * Plugin-level `form.components.field` (src/index.ts): renders the inheritance hint for fields
 * marked by `builders.inherited` (`options.inherit`) / `builders.inheritedBy`
 * (`options.inheritedBy`); every other field passes straight through.
 * Not a field-level `components.field`: Sanity replaces a type's `components` with the field's
 * (no merge), so that would drop e.g. the internationalized-array input of i18n fields.
 */
export function InheritanceField(props: FieldProps): ReactElement {
  const options = props.schemaType.options as
    { inherit?: InheritSpec; inheritedBy?: InheritSpec } | undefined
  if (options?.inherit) return <InheritedField {...props} spec={options.inherit} />
  if (options?.inheritedBy) return <OverriddenByVariants {...props} spec={options.inheritedBy} />
  return props.renderDefault(props)
}
