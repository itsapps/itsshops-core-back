import { CogIcon } from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";


export const settings: ITSSchemaDefinition = {
  name: 'settings',
  type: 'document',
  icon: CogIcon,
  isSingleton: true,
  build: (ctx) => {
    const { f } = ctx;
    return {
      groups: [
        { name: 'site', default: true},
        { name: 'displays'},
        { name: 'analytics'},
      ],
      fields: [
        f('gta', 'number'),
      ],
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
};
