import { LocaleImage, ImageOptions } from '../types'
import { useITSContext } from '../context/ITSCoreProvider'
import { SimpleImage } from './SimpleImage';

export type LocaleImageProps = {
  image?: LocaleImage;
  options?: ImageOptions;
}

export const LocaleImageView = ({ image, options }: LocaleImageProps) => {
  const { localizer } = useITSContext();
  const img = localizer.value(image?.image)
  const title = localizer.value(image?.title)
  const alt = localizer.value(image?.alt)

  return (
    <SimpleImage source={img} title={title} alt={alt} options={options} />
  );
}
