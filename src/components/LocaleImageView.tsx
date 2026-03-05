import { ReactElement } from 'react'
import type { Image } from 'sanity'

import { useITSContext } from '../context/ITSCoreProvider'
import { ImageOptions, LocaleImage } from '../types'
import { SimpleImage } from './SimpleImage'

export type LocaleImageProps = {
  image?: LocaleImage
  options?: ImageOptions
}

export const LocaleImageView = ({ image, options }: LocaleImageProps): ReactElement => {
  const { localizer } = useITSContext()
  const img = localizer.value<Image | undefined>(image?.image)
  const alt = localizer.value(image?.alt)

  return <SimpleImage source={img} alt={alt} options={options} />
}
