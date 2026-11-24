import type { ITSFormatter, ITSLocalizer } from '../types/localization'

type Deps = { localizer: Pick<ITSLocalizer, 'value'>; format: Pick<ITSFormatter, 'number'> }

export type VariantDetailsInput = {
  kind?: string | null
  /** ml */
  wineVolume?: number | null
  wineVintage?: string | null
  /** Option titles (i18n values) of physical/digital variants. */
  optionTitles?: unknown[] | null
}

export type VariantLabelInput = VariantDetailsInput & {
  /** The variant's own title (i18n value). */
  title?: unknown
  productTitle?: unknown
}

/**
 * What tells one variant of a product from another: wine → "0,75 l • 2023", physical/digital →
 * the option titles ("Rot • XL"), anything else → ''. Shared by the productVariant preview, the
 * bundle item preview and the Product Manager's bundle dropdown.
 */
export function variantDetails({ localizer, format }: Deps, v: VariantDetailsInput): string {
  switch (v.kind) {
    case 'wine': {
      const volume = v.wineVolume
      const liter =
        volume && Number.isInteger(volume)
          ? format.number(volume / 1000, { style: 'unit', unit: 'liter' })
          : volume
      return [liter, v.wineVintage].filter(Boolean).join(' • ')
    }
    case 'physical':
    case 'digital':
      return (v.optionTitles ?? [])
        .map((title) => localizer.value(title as never))
        .filter(Boolean)
        .join(' • ')
    default:
      return ''
  }
}

/** "Product — Variant title — 0,75 l • 2023"; parts that are empty are left out. */
export function variantLabel(deps: Deps, v: VariantLabelInput): string {
  return [
    deps.localizer.value(v.productTitle as never),
    deps.localizer.value(v.title as never),
    variantDetails(deps, v),
  ]
    .filter(Boolean)
    .join(' — ')
}

/** Sorts labels alphabetically, numbers by value ("2 l" before "10 l"), case-insensitive. */
export function compareLabels(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}
