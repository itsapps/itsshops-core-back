import { createImageUrlBuilder } from '@sanity/image-url'
import { SanityClient } from 'sanity'

import { ITSImageBuilder } from '../types'

export const createImageBuilder = (client: SanityClient): ITSImageBuilder => {
  const imageBuilder = createImageUrlBuilder(client)

  return {
    builder: imageBuilder,

    // Use 'urlFor' naming convention (standard in Sanity projects)
    urlFor: (source) => imageBuilder.image(source),

    // Your specific helper
    getUrl: ({ source, width, height, quality = 80 }) => {
      if (!source) return ''

      let url = imageBuilder
        .image(source)
        .auto('format') // Crucial for performance
        .quality(quality)

      if (width) url = url.width(width)
      if (height) url = url.height(height)

      // 'fit' ensures the hotspot is respected when cropping
      return url.fit('crop').url()
    },

    getPreviewUrl: (source, size = 100) => {
      if (!source) return undefined

      // Get screen density (usually 1, 2, or 3)
      const dpr =
        typeof window === 'undefined' ? 1 : Math.min(Math.ceil(window.devicePixelRatio || 1), 3)

      return imageBuilder
        .image(source)
        .width(size * dpr)
        .height(size * dpr)
        .quality(80)
        .auto('format')
        .fit('crop')
        .url()
    },
  }
}
