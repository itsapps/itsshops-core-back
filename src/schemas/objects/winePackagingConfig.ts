import { ITSSchemaDefinition } from '../../types'

export const winePackagingConfig: ITSSchemaDefinition = {
  name: 'winePackagingConfig',
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
        f('packages', 'array', {
          of: [{ type: 'winePackage' }],
          validation: (Rule) => Rule.required().min(1).unique(),
        }),
      ],
      preview: {
        select: { volume: 'volume', packages: 'packages' },
        prepare({ volume, packages }) {
          const counts = (packages ?? [])
            .map((p: any) => p.count)
            .filter(Boolean)
            .join(', ')
          return {
            title: volume ? `${volume} ml` : '—',
            subtitle: counts
              ? `${counts} ${ctx.t.default('winePackagingConfig.fields.packages.title')}`
              : '',
          }
        },
      },
    }
  },
}
