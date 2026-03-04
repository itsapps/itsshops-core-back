// import { FieldDefinition } from 'sanity'
import { SanityImageSource } from './components'

export type WithOptionalTitle<T> = Omit<T, 'title'> & { title?: string }

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

export type ITSImageBuilder = {
  builder: any
  urlFor: (source: SanityImageSource) => any
  getUrl: (params: {
    source: SanityImageSource
    width?: number
    height?: number
    quality?: number
  }) => string
  getPreviewUrl: (source: SanityImageSource, size?: number) => string | undefined
}
