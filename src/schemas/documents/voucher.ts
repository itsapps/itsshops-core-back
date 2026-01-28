import { Barcode } from 'phosphor-react'
import { ITSContext, FieldContext, CoreDocument } from "../../types";


export const voucher: CoreDocument = {
  name: 'voucher',
  icon: Barcode,
  feature: 'shop',
  baseFields: (ctx: FieldContext) => {
    const { f } = ctx;
    return [
      f('title', 'i18nString', { i18n: 'atLeastOne' }),
    ]
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
};
