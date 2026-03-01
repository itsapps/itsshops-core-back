import { ITSImageDefinition } from '../../types'

export const cropImage: ITSImageDefinition = {
  name: 'cropImage',
  type: 'image',
  build: () => {
    return {
      options: { hotspot: true },
      // preview: {
      //   select: {
      //     // asset: 'asset',
      //     // crop: 'crop',
      //     // hotspot: 'hotspot',
      //   },
      //   prepare: () => {
      //     return {
      //       title: 'hi',
      //       // media: { asset, crop, hotspot } as any,
      //     }
      //   },
      // },
    }
  },
}
