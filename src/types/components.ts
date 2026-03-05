// import { SanityImageSource } from 'sanity/image-url/lib/types/types';
// export type SanityImageSource = {
//   asset: any
//   crop?: any
//   hotspot?: any
// }
import type { ComponentProps } from 'react'
import type { Image } from 'sanity'
import { type UserViewComponent } from 'sanity/structure'

export type UserViewDocument = ComponentProps<UserViewComponent>['document']

// import type { SanityImageAsset } from './sanity.types'

// export interface Image {
//   image?: SanityImageAsset
//   title?: string
//   alt?: string
// }

export type ImageOptions = {
  width?: number
  height?: number
}
export type SimpleImageProps = {
  source?: Image
  title?: string
  alt?: string
  options?: ImageOptions
}
