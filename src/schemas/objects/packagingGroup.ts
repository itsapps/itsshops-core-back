import { ITSSchemaDefinition } from '../../types'

/**
 * A box type of a shipping method: the boxes (by places, with price) and which bottle sizes go in
 * them. `perPlace` = bottles of that size per place (e.g. 2 × 0.375 l in one 0.75 l place). No text
 * fields — every label is derived from the bottle sizes (see `packagingGroupLabel`).
 */
export const packagingGroup: ITSSchemaDefinition = {
  name: 'packagingGroup',
  type: 'object',
  feature: 'shop',
  build: (ctx) => {
    const { f, t } = ctx
    return {
      fields: [
        f('bottles', 'array', {
          of: [{ type: 'packagingGroupBottle' }],
          validation: (Rule) =>
            Rule.required()
              .min(1)
              .custom((bottles: { volume?: number }[] | undefined) => {
                const volumes = (bottles ?? []).map((b) => b.volume).filter((v) => v !== undefined)
                return new Set(volumes).size === volumes.length
                  ? true
                  : t.default('validation.duplicateVolume', 'Duplicate volume')
              }),
        }),
        f('packages', 'array', {
          of: [{ type: 'packagingGroupPackage' }],
          validation: (Rule) =>
            Rule.required()
              .min(1)
              .custom((packages: { places?: number }[] | undefined) => {
                const places = (packages ?? []).map((p) => p.places).filter((p) => p !== undefined)
                return new Set(places).size === places.length
                  ? true
                  : t.default('validation.duplicatePlaces', 'Duplicate box size')
              }),
        }),
      ],
      preview: {
        select: { bottles: 'bottles', packages: 'packages' },
        prepare({ bottles, packages }) {
          const sizes = [...((bottles ?? []) as { volume?: number; perPlace?: number }[])]
            .filter((b) => b.volume)
            .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
            .map((b) => {
              const size = ctx.format.number((b.volume ?? 0) / 1000, {
                style: 'unit',
                unit: 'liter',
              })
              return (b.perPlace ?? 1) > 1 ? `${size} (${b.perPlace}×)` : size
            })
          const places = ((packages ?? []) as { places?: number }[])
            .map((p) => p.places)
            .filter((p): p is number => Boolean(p))
            .sort((a, b) => a - b)
          return {
            title: sizes.length ? sizes.join(' / ') : '—',
            subtitle: places.length
              ? `${t.default('packagingGroup.fields.packages.title')}: ${places.join(', ')}`
              : '',
          }
        },
      },
    }
  },
}
