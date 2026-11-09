import { OrderWithdrawalIcon } from '../assets/icons'
import type { ITSStructureComponent } from '../types'
import { OPEN_STATUSES } from '../utils/withdrawals'

const canHandleWithdrawal = (intent: string, params: { type?: string }) =>
  intent === 'edit' && params.type === 'orderWithdrawal'

/**
 * "Withdrawals" → "Open" (unmatched + received/processing, nearest deadline first) and "Done"
 * (refunded/rejected, newest first). Both handle the `edit` intent, so the order view's links
 * open withdrawals here.
 */
export const withdrawalsMenu: ITSStructureComponent = (S, _context, ctx) => {
  const apiVersion = ctx.config.apiVersion
  const t = ctx.structureT.default
  // A `custom` item skips `fromRegistry`, which applies the extension icon.
  const icon = ctx.config.schemaExtensions?.orderWithdrawal?.icon ?? OrderWithdrawalIcon
  const title = t('orderWithdrawal.title')

  return S.listItem()
    .id('orderWithdrawal')
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .id('orderWithdrawal')
        .title(title)
        .items([
          S.listItem()
            .id('orderWithdrawalOpen')
            .title(t('orderWithdrawal.open'))
            .icon(icon)
            .child(
              S.documentTypeList('orderWithdrawal')
                .id('orderWithdrawalOpen')
                .title(t('orderWithdrawal.open'))
                .apiVersion(apiVersion)
                .filter('_type == "orderWithdrawal" && status in $open')
                .params({ open: ['unmatched', ...OPEN_STATUSES] })
                .defaultOrdering([{ field: 'declaredAt', direction: 'asc' }])
                .canHandleIntent(canHandleWithdrawal),
            ),
          S.listItem()
            .id('orderWithdrawalClosed')
            .title(t('orderWithdrawal.closed'))
            .icon(icon)
            .child(
              S.documentTypeList('orderWithdrawal')
                .id('orderWithdrawalClosed')
                .title(t('orderWithdrawal.closed'))
                .apiVersion(apiVersion)
                .filter('_type == "orderWithdrawal" && status in ["refunded", "rejected"]')
                .defaultOrdering([{ field: 'declaredAt', direction: 'desc' }])
                .canHandleIntent(canHandleWithdrawal),
            ),
        ]),
    )
}
