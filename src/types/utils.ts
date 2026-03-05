// import { FieldDefinition } from 'sanity'
import type { Image } from 'sanity'
// import { SanityImageSource } from './components'

export type WithOptionalTitle<T> = Omit<T, 'title'> & { title?: string }

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

export type ITSImageBuilder = {
  builder: any
  urlFor: (source: Image) => any
  getUrl: (params: { source: Image; width?: number; height?: number; quality?: number }) => string
  getPreviewUrl: (source: Image, size?: number) => string | undefined
}
