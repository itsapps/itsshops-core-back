import { ITSSchemaDefinition } from '../../../types'

export const orderItemWine: ITSSchemaDefinition = {
  name: 'orderItemWine',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f } = ctx
    return {
      fields: [
        f('vintage', 'string'),
        f('volume', 'number', {
          description: 'Volume in ml',
          validation: (rule) => rule.positive().integer(),
        }),
      ],
      preview: {
        select: {
          vintage: 'vintage',
          volume: 'volume',
        },
        prepare({ vintage, volume }) {
          const parts = [volume ? `${volume}ml` : null, vintage ?? null].filter(Boolean)
          return {
            title: parts.join(' • ') || 'Wine',
          }
        },
      },
    }
  },
}
