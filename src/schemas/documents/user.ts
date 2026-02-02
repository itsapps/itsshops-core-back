import { UserIcon } from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";


export const user: ITSSchemaDefinition = {
  name: 'user',
  type: 'document',
  icon: UserIcon,
  feature: 'users',
  disallowedActions: [ 'duplicate' ],
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
      ],
    }
  }
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
