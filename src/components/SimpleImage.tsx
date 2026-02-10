import { SimpleImageProps } from '../types'
import { useITSContext } from '../context/ITSCoreProvider'
import React from 'react';
import { Image as ImageIcon } from 'phosphor-react'

export const SimpleImage = (props: SimpleImageProps) => {
  const { imageBuilder } = useITSContext();
  const { options, source, title, alt } = props

  const width = options?.width || options?.height || 50
  const height = options?.height || options?.width || 50
  const size = options?.width || options?.height || 50

  if (!source) return <ImageIcon size={size} />
  
  const url = imageBuilder.getUrl({ source, width, height })
  if (!url) return <ImageIcon size={size} />

  return (
    <img
      src={url}
      title={title}
      alt={alt}
      width={width}
      height={height}
    />
  );
}
