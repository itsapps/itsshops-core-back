import { ITSImageDefinition } from '../../types'

export const cropImage: ITSImageDefinition = {
  name: 'cropImage',
  type: 'image',
  build: () => {
    return {
      options: { hotspot: true },
      // preview: {
      //   select: {
      //     asset: 'asset',
      //     crop: 'crop',
      //     hotspot: 'hotspot',
      //   },
      //   prepare: ({ asset, crop, hotspot }) => {
      //     return {
      //       media: { asset, crop, hotspot } as any,
      //     };
      //   }
      // },
    }
  },
}
