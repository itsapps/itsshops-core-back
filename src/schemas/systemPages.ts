import { ITSContext, ITSFeatureKey } from '../types'

// Fixed frontend routes (not documents) an editor can link to — from a menu (`menuItem.linkType:
// 'system'`) or a rich-text internal link (`internalLinkFields({ includeSystemPages: true })`).
// The frontend resolves each to its URL and drops the link when the feature is off.
const systemPages: { value: string; feature: ITSFeatureKey }[] = [
  { value: 'orderWithdraw', feature: 'shop' },
]

export const enabledSystemPages = (ctx: ITSContext) =>
  systemPages.filter((p) => ctx.featureRegistry.isFeatureEnabled(p.feature))
