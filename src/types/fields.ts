import { NumberRule } from 'sanity'

export type PriceOptions = {
  ns?: string
  name?: string
  group?: string
  validation?: (rule: NumberRule) => NumberRule | NumberRule[]
  initialValue?: number,
  hidden?: boolean | ((parent: any) => boolean)
}

// export type CoreModules