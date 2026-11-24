export type VinofactWine = {
  id: string
  slug: string
  title: string
  year: string | null
  editUrl: string
}

export type VinofactWinesResponse = {
  wines: VinofactWine[]
}

/** A wine's pooled bottle image on VinoFact's dated API (`ImageType`). */
export type VinofactBottleImage = {
  /** imgproxy URL template with `{{width}}` / `{{height}}` placeholders, VinoFact's crop baked in. */
  url: string
  /** Per VinoFact language key (`de`, `zhCn`, …); a value is `null` when VinoFact has no alt. */
  alt: Record<string, string | null> | null
  /** Intrinsic size after VinoFact's crop; `null` when unknown. */
  width: number | null
  height: number | null
}

export type VinofactBottleImagesResponse = {
  wines: { id: string; bottleImage: VinofactBottleImage | null }[]
}

export type ITSVinofactClient = {
  getWines: () => Promise<VinofactWinesResponse>
  /** Bottle images of the given wines, alts for the given content locales (`fieldLocales`). */
  getBottleImages: (ids: string[], locales: string[]) => Promise<VinofactBottleImagesResponse>
}
