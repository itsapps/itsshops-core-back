import { VoucherIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'

export const voucher: ITSDocumentDefinition = {
  name: 'voucher',
  type: 'document',
  icon: VoucherIcon,
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [f('title', 'i18nString', { i18n: 'atLeastOne' })],
    }
  },
  // preview: (ctx: ITSContext) => {
  //   return {
  //     select: {
  //       title: 'title',
  //       subtitle: 'parent.title',
  //       media: 'image',
  //     },
  //     prepare(s: any) {
  //       const { title, subtitle, media } = s
  //       const sub = ctx.getLocalizedValue(subtitle)
  //       return {
  //         title: ctx.getLocalizedValue(title),
  //         subtitle: sub ? `– ${sub}` : ``,
  //         media: media,
  //       }
  //     },
  //   }
  // }
}
