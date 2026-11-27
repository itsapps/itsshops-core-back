import { ComponentType, ReactNode } from 'react'

import { ProductKind, VinofactWine } from '../../../types'

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

/** The statuses the tool offers (the others are set in the variant document). */
export type NewVariantStatus = 'active' | 'comingSoon'

/** Per-row extras under "Advanced": status, SKU and (not bundles) stock. */
export interface VariantExtras {
  status: NewVariantStatus
  sku: string
  /** As typed: '' = unset (unlimited), else a whole number ≥ 0 (checked before submit). */
  stock: string
}

export interface WineRow extends VariantExtras {
  id: string
  wine: VinofactWine | null
  volume: string
  price: number | undefined // cents
  taxCategoryId: string
  titles: I18nTitleEntry[]
}

export interface WineOption {
  value: string
  payload: VinofactWine
}

export interface Option {
  _id: string
  title: string
  sortOrder: number
}

export interface OptionGroup {
  _id: string
  title: string
  sortOrder: number
  options: Option[]
}

export interface CombinationRow extends VariantExtras {
  id: string
  // one optionId per group, parallel to selectedGroups order
  optionIds: string[]
  enabled: boolean
  price: number | undefined
  weight: number | undefined
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
  optionTitles?: unknown[] | null
}

export interface BundleItem {
  variantId: string
  variantLabel: string // display label for the picker chip
  quantity: string
}

export interface BundleVariantRow extends Omit<VariantExtras, 'stock'> {
  id: string
  items: BundleItem[]
  price: number | undefined
  titles: I18nTitleEntry[]
}

export interface MainProductProps {
  kind: ProductKind
  titlePlaceholder: string
  titles: I18nTitleEntry[]
  globalPrice: number | undefined
  globalTaxCategoryId: string
  globalWeight: number | undefined
  taxCategories: TaxCategory[]
  loadingTax: boolean
  /** `shopSettings.defaultTaxCategory` — shown as a hint, never written onto the product. */
  shopDefaultTaxCategoryId?: string
  locales: string[]
  defaultLocale: string
  onTitlesChange: (titles: I18nTitleEntry[]) => void
  onGlobalPriceChange: (val: number | undefined) => void
  onGlobalTaxChange: (val: string) => void
  onGlobalWeightChange: (val: number | undefined) => void
  /** Product categories / manufacturers (creating only; omitted = field not shown). */
  categoryChoices?: ChoiceGroup
  manufacturerChoices?: ChoiceGroup
  /** The wine tab's title suggestion: note + restore button at the default-locale title. */
  titleHint?: ReactNode
  titleAction?: ReactNode
  titleInputId?: string
}

export interface ChoiceOption {
  _id: string
  title: string
  /** Indent level (subcategories). */
  depth?: number
}

/** A checkbox list (categories, manufacturers) with its selection. */
export interface ChoiceGroup {
  options: ChoiceOption[]
  selected: string[]
  onChange: (ids: string[]) => void
}

/** One line of the summary above the submit button. */
export interface SummaryLine {
  key: string
  label: string
  /** Own price, else the product's (cents); `undefined` = none. */
  price: number | undefined
  status: NewVariantStatus
}

/** Whether a tab can submit, and why not (translated, shown above the button). */
export interface SubmitCheck {
  ok: boolean
  reasons: string[]
}

export interface ProductTabProps {
  content: ReactNode
  global: MainProductProps
  submitting: boolean
  rows: number
  submitCheck: SubmitCheck
  handleSubmit: () => void
  hideProductSection?: boolean
  /** The variants that will be created (summary above the button). */
  summaryLines: SummaryLine[]
}
export interface ProductKindTabProps {
  global: MainProductProps
  submitting: boolean
  hideProductSection?: boolean
}

export interface WineSubmitOptions {
  /** Copy each new variant's VinoFact bottle image into its `image` after the commit. */
  importBottleImages: boolean
}

export interface WineTabProps extends ProductKindTabProps {
  /** Resolves `true` when the commit succeeded (the tab resets only then). */
  onSubmit: (rows: WineRow[], options: WineSubmitOptions) => Promise<boolean>
  existingWineKeys?: Set<string>
  /**
   * Adding to an existing product: the VinoFact ids of its wine variants. They seed the grid
   * (with their same-name vintages) instead of the "pick a first wine" step.
   */
  seedWineIds?: string[]
}

export interface PhysicalDigitalTabProps extends ProductKindTabProps {
  activeKind: ProductKind
  onSubmit: (combinations: CombinationRow[]) => Promise<boolean>
  existingOptionSets?: Set<string>
}

export interface BundleTabProps extends ProductKindTabProps {
  onSubmit: (rows: BundleVariantRow[]) => Promise<boolean>
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
  /** The input's `id` (default: generated) — lets a caller move focus to it. */
  id?: string
  /** Note below the input, linked with `aria-describedby`. */
  hint?: ReactNode
  /** A control next to the input (e.g. "restore suggestion"). */
  action?: ReactNode
}

export interface LabelFieldProps {
  /** The labelled control's `id`. */
  id: string
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
  /** Hint + action + `id` for the default locale's input (the wine tab's title suggestion). */
  hint?: ReactNode
  action?: ReactNode
  defaultInputId?: string
}

export interface PriceFieldProps {
  value: number | undefined
  onChange: (cents: number | undefined) => void
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  /** Placeholder of an empty field when the value is inherited ("14,90 € vom Produkt"). */
  inheritedLabel?: string
}

export interface WeightFieldProps {
  value: number | undefined
  onChange: (val: number | undefined) => void
  required?: boolean
}

export interface TaxCategoryFieldProps {
  value: string
  taxCategories: TaxCategory[]
  loadingTax: boolean
  onTaxChange: (val: string) => void
  required?: boolean
  /** Read-only note below the select (e.g. the shop default). */
  hint?: string
  /** Text of the empty option: what an empty value inherits ("vom Produkt: …"). */
  inheritedLabel?: string
}

export interface GlobalDefaultsProps {
  kind: ProductKind
  globalPrice: number | undefined
  globalTaxCategoryId: string
  taxCategories: TaxCategory[]
  loadingTax: boolean
  shopDefaultTaxCategoryId?: string
  globalWeight: number | undefined
  manufacturerChoices?: ChoiceGroup
  onPriceChange: (val: number | undefined) => void
  onTaxChange: (val: string) => void
  onWeightChange: (val: number | undefined) => void
}

export interface VariantSectionHeaderProps {
  count: number
  /** Overrides "Varianten" (the wine tab says "Jahrgänge & Flaschen"). */
  title?: string
  description?: string
}

export interface WineVariantCardProps {
  row: WineRow
  index: number
  /** "Ried Steinberg — 0,75 l • 2023" */
  label: string
  loadingTax: boolean
  taxCategories: TaxCategory[]
  locales: string[]
  defaultLocale: string
  titlePlaceholder: string
  /** Placeholder of an empty price / text of the empty tax option (B4). */
  priceInherited?: string
  taxInherited: string
  onUpdate: (id: string, key: keyof WineRow, val: any) => void
  onRemove: (id: string) => void
}

export interface OptionToggleCardProps {
  groupId: string
  option: Option
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
  showWeight: boolean
  /** Placeholder of an empty price / text of the empty tax option (inherited values). */
  priceInherited?: string
  taxInherited: string
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
