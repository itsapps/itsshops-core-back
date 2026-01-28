import { ITSi18nImage, ITSi18nArray } from "./localization";
import type { SanityDocument, SanityDocumentLike, Reference } from 'sanity'

export type DocumentReference = {
  _type: string;
  _ref: string;
}

export type VariantOption = {
  _id: string
  title: ITSi18nImage
}

export type VariantOptionGroup = {
  _id: string
  title: ITSi18nArray,
  sortOrder: number,
  options: VariantOption[]
}

export type Variant = SanityDocument & {
  _id: string;
  _rev: string;
  options: VariantOption[];
  title: ITSi18nArray;
  featured: boolean;
  price?: number;
  coverImage: string;
  productNumber?: string;
  active: boolean;
}

export type NewVariant = SanityDocumentLike & {
  _id: string;
  _type: string;
  title: ITSi18nArray;
  productNumber?: string;
  options: Reference[];
  featured: boolean;
  active: boolean;
  price?: number;
}

export type Product = SanityDocument & {
  images?: ITSi18nImage[],
  price?: number,
  productNumber?: string,
  title: ITSi18nArray,
}

export type VariantContainer = {
  _id: string,
  published: Variant
  draft?: Variant,
}