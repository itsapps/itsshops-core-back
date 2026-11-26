/**
 * GROQ `order()` arguments for a product's variants in the Studio (product child list, product
 * preview image): wine by vintage + volume, physical/digital by their options' `sortOrder` (as the
 * variant axes on the site), `_createdAt` keeps everything else (bundles) stable.
 */
export const VARIANT_ORDER =
  'wine.vintage desc, wine.volume desc, options[0]->sortOrder asc, options[1]->sortOrder asc, options[2]->sortOrder asc, _createdAt asc'
