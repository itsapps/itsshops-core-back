import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface Image {
  image?: SanityImageSource;
  title?: string;
  alt?: string;
}

export type ImageOptions = {
  width?: number;
  height?: number;
}
export type SimpleImageProps = {
  source?: SanityImageSource;
  title?: string;
  alt?: string;
  options?: ImageOptions;
}
