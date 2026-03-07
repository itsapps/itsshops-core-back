import { WineIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'
// import { WineIdInput } from '../../components/products/WineIdInput'

export const wine: ITSSchemaDefinition = {
  name: 'wine',
  type: 'object',
  feature: 'shop.productKind.wine',
  icon: WineIcon,
  build: (ctx) => {
    const { f } = ctx
    const vinofactEnabled = ctx.featureRegistry.isFeatureEnabled('shop.vinofact')
    return {
      fields: [
        ...(vinofactEnabled
          ? [
              f('vinofactWineId', 'string', {
                validation: (Rule) => Rule.required(),
                // components: { input: WineIdInput },
              }),
            ]
          : []),
        f('volume', 'number', {
          validation: (Rule) => Rule.required(),
          options: {
            list: ctx.constants.volumeOptions,
          },
        }),
        ctx.f('vintage', 'string'),
      ],
      // preview: {
      //   select: {
      //     title: 'url',
      //     subtitle: 'start',
      //   },
      // },
    }
  },
}
