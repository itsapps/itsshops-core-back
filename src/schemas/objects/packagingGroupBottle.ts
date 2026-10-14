import { ITSSchemaDefinition } from '../../types'

export const packagingGroupBottle: ITSSchemaDefinition = {
  name: 'packagingGroupBottle',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('volume', 'number', {
          options: { list: ctx.constants.volumeOptions },
          validation: (Rule) => Rule.required(),
        }),
        f('perPlace', 'number', {
          initialValue: 1,
          validation: (Rule) => Rule.required().integer().min(1),
        }),
      ],
      preview: {
        select: { volume: 'volume', perPlace: 'perPlace' },
        prepare({ volume, perPlace }) {
          return {
            title: volume
              ? ctx.format.number(volume / 1000, { style: 'unit', unit: 'liter' })
              : '—',
            subtitle: perPlace
              ? ctx.t.default('packagingGroupBottle.preview.perPlace', `${perPlace}`, {
                  count: perPlace,
                })
              : '',
          }
        },
      },
    }
  },
}
