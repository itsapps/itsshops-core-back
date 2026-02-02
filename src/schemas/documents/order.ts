import { TrolleyIcon } from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";


export const order: ITSSchemaDefinition = {
  name: 'order',
  type: 'document',
  icon: TrolleyIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate' ],
  allowCreate: true,
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
      ],
      // preview: {
      //   select: {
      //     title: 'title',
      //     subtitle: 'parent.title',
      //     media: 'image',
      //   },
      //   prepare(s: any) {
      //     const { title, subtitle, media } = s
      //     const sub = ctx.getLocalizedValue(subtitle)
      //     return {
      //       title: ctx.getLocalizedValue(title),
      //       subtitle: sub ? `– ${sub}` : ``,
      //       media: media,
      //     }
      //   }
      // }
    }
  }
};
