import { WrenchIcon } from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";

export const manufacturer: ITSSchemaDefinition = {
  name: 'manufacturer',
  type: 'document',
  icon: WrenchIcon,
  feature: 'shop.manufacturer',
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('description', 'i18nText'),
        f('link', 'url'),
        f('image', 'i18nImage'),
      ],
      preview: {
        select: {
          title: 'title',
          image: "image"
        },
        prepare({ title, image }) {
          const img = ctx.localizer.value<any>(image)
          return {
            title: ctx.localizer.value(title),
            media: img?.asset || WrenchIcon,
          }
        }
      }
    }
  }
};
