import { ComponentType, ReactNode } from 'react'

import { ProductKind, VinofactWine, VolumeOption } from '../../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TaxCategory {
  _id: string
  title: string
  code: string
}

export interface I18nTitleEntry {
  locale: string
  value: string
}

export interface WineRow {
  id: string
  wine: VinofactWine | null
  volume: string
  price: number | undefined // display euros e.g. "24.90" — converted to cents on submit
  taxCategoryId: string
  titles: I18nTitleEntry[]
}

export interface WineOption {
  value: string
  payload: VinofactWine
}

export interface VariantOption {
  _id: string
  title: string
  sortOrder: number
}

export interface OptionGroup {
  _id: string
  title: string
  sortOrder: number
  options: VariantOption[]
}

export interface CombinationRow {
  id: string
  // one optionId per group, parallel to selectedGroups order
  optionIds: string[]
  enabled: boolean
  price: number | undefined
  taxCategoryId: string
  titles: I18nTitleEntry[]
  alreadyExists?: boolean
}

export interface BundleVariantResult {
  _id: string
  title: string | null
  productTitle: string | null
  kind: string
  wineVolume?: number
  wineVintage?: string
}

export interface BundleItem {
  variantId: string
  variantLabel: string // display label for the picker chip
  quantity: string
}

export interface BundleVariantRow {
  id: string
  items: BundleItem[]
  price: number | undefined
  taxCategoryId: string
  titles: I18nTitleEntry[]
}

export interface MainProductProps {
  titlePlaceholder: string
  titles: I18nTitleEntry[]
  globalPrice: number | undefined
  globalTaxCategoryId: string
  taxCategories: TaxCategory[]
  loadingTax: boolean
  locales: string[]
  defaultLocale: string
  onTitlesChange: (titles: I18nTitleEntry[]) => void
  onGlobalPriceChange: (val: number | undefined) => void
  onGlobalTaxChange: (val: string) => void
}

export interface ProductTabProps {
  content: ReactNode
  global: MainProductProps
  submitting: boolean
  rows: number
  canSubmit: boolean
  handleSubmit: () => void
  hideProductSection?: boolean
}
export interface ProductKindTabProps {
  global: MainProductProps
  submitting: boolean
  hideProductSection?: boolean
}

export interface WineTabProps extends ProductKindTabProps {
  onSubmit: (rows: WineRow[]) => Promise<void>
  existingWineKeys?: Set<string>
}

export interface PhysicalDigitalTabProps extends ProductKindTabProps {
  onSubmit: (combinations: CombinationRow[]) => Promise<void>
  existingOptionSets?: Set<string>
}

export interface BundleTabProps extends ProductKindTabProps {
  onSubmit: (rows: BundleVariantRow[]) => Promise<void>
}

export interface BundleVariantRowItemProps {
  item: BundleItem
  rowId: string
  onRemove: (rowId: string, variantId: string) => void
  onQuantityChange: (rowId: string, variantId: string, quantity: string) => void
}

export interface BundleVariantRowProps {
  row: BundleVariantRow
  index: number
  canRemove: boolean
  allVariantOptions: { value: string; payload: BundleVariantResult }[]
  loadingVariants: boolean
  taxCategories: TaxCategory[]
  loadingTax: boolean
  locales: string[]
  defaultLocale: string
  titlePlaceholder: string
  globalPrice: number | undefined
  getVariantLabel: (v: BundleVariantResult) => string
  onRemoveRow: (id: string) => void
  onAddItem: (rowId: string, variantId: string) => void
  onRemoveItem: (rowId: string, variantId: string) => void
  onQuantityChange: (rowId: string, variantId: string, quantity: string) => void
  onUpdateRow: (id: string, key: keyof BundleVariantRow, val: any) => void
}

// ─── Shared: i18n Title Inputs ────────────────────────────────────────────────
export interface LocaleTitleInputProps {
  locale: string
  required?: boolean
  value: string
  onChange: (locale: string, value: string) => void
  placeholder?: string
}

export interface LabelFieldProps {
  title: string
  required?: boolean
  children: ReactNode
}

export interface I18nTitleInputsProps {
  locales: string[]
  defaultLocale: string
  requiredLocales: string[]
  required: boolean
  titles: I18nTitleEntry[]
  onChange: (titles: I18nTitleEntry[]) => void
  placeholder?: string
}

export interface PriceFieldProps {
  value: number | undefined
  onChange: (cents: number | undefined) => void
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
}

export interface TaxCategoryFieldProps {
  value: string
  taxCategories: TaxCategory[]
  loadingTax: boolean
  onTaxChange: (val: string) => void
  required?: boolean
}

export interface GlobalDefaultsProps {
  globalPrice: number | undefined
  globalTaxCategoryId: string
  taxCategories: TaxCategory[]
  loadingTax: boolean
  onPriceChange: (val: number | undefined) => void
  onTaxChange: (val: string) => void
}

export interface VariantSectionHeaderProps {
  count: number
}

export interface WineRowCardProps {
  row: WineRow
  index: number
  canRemove: boolean
  options: WineOption[]
  loadingWines: boolean
  loadingTax: boolean
  taxCategories: TaxCategory[]
  volumeOptions: VolumeOption[]
  globalPrice: number | undefined
  globalTaxCategoryId: string
  locales: string[]
  defaultLocale: string
  titlePlaceholder: string
  existingWineKeys?: Set<string>
  onUpdate: (id: string, key: keyof WineRow, val: any) => void
  onRemove: (id: string) => void
  onQueryChange: (id: string, query: string) => void
}

export interface OptionToggleCardProps {
  groupId: string
  option: VariantOption
  checked: boolean
  onToggle: (groupId: string, optionId: string, checked: boolean) => void
}

export interface OptionComboCardProps {
  row: CombinationRow
  index: number
  label: string
  loadingTax: boolean
  taxCategories: TaxCategory[]
  locales: string[]
  defaultLocale: string
  titlePlaceholder: string
  onUpdate: (id: string, key: keyof CombinationRow, val: any) => void
  onToggleCombination: (id: string) => void
}

export interface KindTabProps {
  kind: ProductKind
  activeKind: ProductKind
  label: string
  icon: ComponentType
  onSelect: (value: ProductKind) => void
}
