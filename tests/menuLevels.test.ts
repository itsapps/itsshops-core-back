import { describe, expect, it } from 'vitest'

import { menuItemTypeName, menuItemTypes, menuLevels } from '../src/schemas/objects/menuItem'

// Minimal build context: the field factory returns plain field objects.
const fakeCtx = {
  f: (name: string, type: string, options: Record<string, unknown> = {}) => ({ name, type, ...options }),
  builders: { internalLinkFields: () => [{ name: 'internalLinkReference', type: 'reference' }] },
  featureRegistry: { isFeatureEnabled: () => false },
  config: { schemaSettings: { menus: { allowedReferences: ['page'] } } },
} as any

const built = (levels: number) =>
  menuItemTypes(levels).map((def: any) => {
    const { fields } = def.build(fakeCtx)
    const linkType = fields.find((f: any) => f.name === 'linkType')
    const children = fields.find((f: any) => f.name === 'children')
    return {
      name: def.name,
      baseName: def.baseName,
      choices: linkType.options.list.map((o: any) => o.value),
      childType: children?.of?.[0]?.type,
    }
  })

describe('menu levels (maxDepth = levels, top level included)', () => {
  it('counts levels; maxDepth 1 (or less) = flat', () => {
    expect(menuLevels({ maxDepth: 1 })).toBe(1)
    expect(menuLevels({ maxDepth: 2 })).toBe(2)
    expect(menuLevels({ maxDepth: 0 })).toBe(1)
  })

  it('names one type per level', () => {
    expect([0, 1, 2].map(menuItemTypeName)).toEqual(['menuItem', 'menuItem1', 'menuItem2'])
  })

  it('flat: one link-only type', () => {
    expect(built(1)).toEqual([
      { name: 'menuItem', baseName: 'menuItem', choices: ['internal', 'external'], childType: undefined },
    ])
  })

  it('two levels: submenu only at the top, its children are link-only', () => {
    expect(built(2)).toEqual([
      { name: 'menuItem', baseName: 'menuItem', choices: ['internal', 'external', 'submenu'], childType: 'menuItem1' },
      { name: 'menuItem1', baseName: 'menuItem', choices: ['internal', 'external'], childType: undefined },
    ])
  })

  it('three levels: the last level is the only link-only one', () => {
    expect(built(3).map((t) => [t.name, t.choices.includes('submenu'), t.childType])).toEqual([
      ['menuItem', true, 'menuItem1'],
      ['menuItem1', true, 'menuItem2'],
      ['menuItem2', false, undefined],
    ])
  })
})
