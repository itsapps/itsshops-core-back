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

export type ITSVinofactClient = {
  getWines: () => Promise<VinofactWinesResponse>;
}
