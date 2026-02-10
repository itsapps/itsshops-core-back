import { LocaleImage, ITSi18nArray } from "./localization";
import type { SanityDocument, SanityDocumentLike, Reference } from 'sanity'

export type DocumentReference = {
  _type: string;
  _ref: string;
}

export interface SanityImageWithHotspot {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export type VariantOption = {
  _id: string
  title: ITSi18nArray,
  sortOrder?: number
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
  sku?: string;
  active: boolean;
}

export type NewVariant = SanityDocumentLike & {
  _id: string;
  _type: string;
  title: ITSi18nArray;
  sku?: string;
  options: Reference[];
  featured: boolean;
  active: boolean;
  price?: number;
}

export type Product = SanityDocument & {
  images?: LocaleImage[],
  price?: number,
  sku?: string,
  title: ITSi18nArray,
}

export type VariantContainer = {
  _id: string,
  published: Variant
  draft?: Variant,
}