import { ReactElement } from 'react'

import { useITSContext } from '../context/ITSCoreProvider'
import { ImageOptions, LocaleImage } from '../types'
import { SimpleImage } from './SimpleImage'

export type LocaleImageProps = {
  image?: LocaleImage
  options?: ImageOptions
}

export const LocaleImageView = ({ image, options }: LocaleImageProps): ReactElement => {
  const { localizer } = useITSContext()
  const img = localizer.value<any>(image?.image)
  const title = localizer.value(image?.title)
  const alt = localizer.value(image?.alt)

  return <SimpleImage source={img} title={title} alt={alt} options={options} />
}
