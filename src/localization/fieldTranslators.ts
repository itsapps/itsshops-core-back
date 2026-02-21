import { ITSTranslator } from "../types";
import type { FieldTranslators, FieldTProps, BaseFieldTProps, FieldKeypathTProps, FieldOptionProps, BlockFieldProps } from "../types";

export const createFieldTranslators = (namespace: string, t: ITSTranslator): FieldTranslators => ({
  default: (props) => findDefault({t, namespace, ...props}),
  strict: (props) => findStrict({t, namespace, ...props}),
  option: (props) => findOption({t, namespace, ...props}),
  blockStyle: (props) => findBlockStyle({t, namespace, ...props}),
  block: (props) => translateBlock({t, namespace, ...props}),
});


export const getFieldTranslationKeypaths = ({namespace, fieldGroup, fieldName, attribute }: FieldKeypathTProps & BaseFieldTProps): {local: string, global: string} => {
  // const groupPath = `${fieldGroup}.${fieldName}.${attribute}`
  const groupPath = [fieldGroup, fieldName, attribute].filter(Boolean).join('.')
  return {
    local: `${namespace}.${groupPath}`,
    global: groupPath
  }
};

export const findDefault = (props: FieldTProps & BaseFieldTProps): string => {
  const translationPaths = getFieldTranslationKeypaths(props)
  return props.t.strict(translationPaths.local) || props.t.default(translationPaths.global, props.fieldName)
};
export const findStrict = (props: FieldTProps & BaseFieldTProps): string | undefined => {
  const translationPaths = getFieldTranslationKeypaths(props)
  return props.t.strict(translationPaths.local) || props.t.strict(translationPaths.global)
};
export const findOption = (props: FieldOptionProps & BaseFieldTProps): string => {
  const {namespace, fieldName, value } = props
  const local = `${namespace}.fields.${fieldName}.options.${value}`
  const global = `fields.${fieldName}.options.${value}`

  return props.t.strict(local) || props.t.default(global, value)
};
export const findBlockStyle = (props: FieldOptionProps & BaseFieldTProps): string | undefined => {
  const {namespace, fieldName, value } = props
  const local = `${namespace}.fields.${fieldName}.block.styles.${value}`
  const global = `block.styles.${value}`

  return props.t.strict(local) || props.t.strict(global)
};
export const translateBlock = (props: BlockFieldProps & BaseFieldTProps) => {
  const {namespace, fieldName, block } = props

  block.styles?.forEach(style => {
    const title = style.title ||
      props.t.strict(`${namespace}.fields.${fieldName}.block.styles.${style.value}`) ||
      props.t.strict(`fields.${fieldName}.block.styles.${style.value}`) ||
      props.t.strict(`block.styles.${style.value}`)
    if (title) {
      style.title = title
    }
  })
  block.marks?.decorators?.forEach(decorator => {
    const title = decorator.title ||
      props.t.strict(`${namespace}.fields.${fieldName}.block.marks.decorators.${decorator.value}`) ||
      props.t.strict(`fields.${fieldName}.block.marks.decorators.${decorator.value}`) ||
      props.t.strict(`block.marks.decorators.${decorator.value}`)
    decorator.title = title || decorator.value
  })
  block.marks?.annotations?.forEach(annotation => {
    const title = annotation.title ||
      props.t.strict(`${namespace}.fields.${fieldName}.block.marks.annotations.${annotation.name}`) ||
      props.t.strict(`fields.${fieldName}.block.marks.annotations.${annotation.name}`) ||
      props.t.strict(`block.marks.annotations.${annotation.name}`)
      annotation.title = title || annotation.name
  })
  return block
};