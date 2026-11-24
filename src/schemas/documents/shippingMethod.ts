import { PackageIcon } from '../../assets/icons'
import { ITSDocumentDefinition } from '../../types'
import { requiredSubfields } from '../../utils/validation'

type MethodParent = { methodType?: string } | undefined
const isPickup = (parent: unknown) => (parent as MethodParent)?.methodType === 'pickup'

export const shippingMethod: ITSDocumentDefinition = {
  name: 'shippingMethod',
  type: 'document',
  icon: PackageIcon,
  feature: 'shop',
  build: (ctx) => {
    const { f, t } = ctx
    const hiddenForPickup = ({ parent }: { parent?: unknown }) => isPickup(parent)
    const hiddenUnlessPickup = ({ parent }: { parent?: unknown }) => !isPickup(parent)
    return {
      fields: [
        // f('isDefault', 'boolean', { initialValue: false }),
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        // Optional, e.g. "2–4 Werktage" — snapshotted onto the order, shown in the confirmation mail.
        // For pickup: how long until the order is ready to collect.
        f('deliveryTime', 'i18nString'),
        f('methodType', 'string', {
          options: {
            list: [
              { value: 'delivery' },
              // A pickup location (click & collect); no countries, rates or packaging.
              { value: 'pickup' },
            ],
          },
          initialValue: 'delivery',
          validation: (Rule) => Rule.required(),
        }),
        ctx.builders.priceField({
          name: 'pickupFee',
          initialValue: 0,
          hidden: hiddenUnlessPickup,
        }),
        // Where the customer collects the order. Its country is the VAT country of a pickup
        // order (place of supply), so it must be an enabled tax country.
        f('pickupAddress', 'businessAddress', {
          hidden: hiddenUnlessPickup,
          validation: (rule) => [
            requiredSubfields(['line1', 'zip', 'city', 'country'], t.default, {
              when: (c) => isPickup(c.parent),
            })(rule),
            rule.custom(async (value: { country?: string } | undefined, context) => {
              if (!isPickup(context.parent) || !value?.country) return true
              const client = context.getClient({ apiVersion: ctx.config.apiVersion })
              const count = await client.fetch<number>(
                'count(*[_type == "taxCountry" && enabled == true && countryCode == $code])',
                { code: value.country },
              )
              return count > 0
                ? true
                : {
                    message: t.default(
                      'validation.pickupCountryNotTaxCountry',
                      'The country must be an enabled tax country',
                    ),
                    path: ['country'],
                  }
            }),
          ],
        }),
        f('pickupInstructions', 'i18nText', { hidden: hiddenUnlessPickup }),
        f('pickupHoldDays', 'number', {
          hidden: hiddenUnlessPickup,
          validation: (rule) => rule.integer().min(1),
        }),
        // On: the shop prepares the order first — the confirmation and the thanks page announce
        // the "ready for pickup" mail. Off: the goods can be collected right away.
        f('pickupAnnounceReady', 'boolean', { hidden: hiddenUnlessPickup, initialValue: false }),
        f('eligibleCountries', 'array', {
          hidden: hiddenForPickup,
          of: [
            {
              type: 'reference',
              to: [{ type: 'taxCountry' }],
              options: { filter: 'enabled == true' },
              title: t.default('taxCountry.title'),
              validation: (Rule) => Rule.required(),
            },
          ],
          validation: (Rule) =>
            Rule.unique().custom((value: unknown[] | undefined, context) =>
              isPickup(context.parent) || (value?.length ?? 0) > 0
                ? true
                : context.i18n.t('validation:generic.required'),
            ),
        }),
        f('rates', 'array', {
          of: [{ type: 'shippingRate' }],
          hidden: hiddenForPickup,
        }),
        f('packagingGroups', 'array', {
          of: [{ type: 'packagingGroup' }],
          hidden: hiddenForPickup,
          validation: (Rule) =>
            Rule.custom((groups: { bottles?: { volume?: number }[] }[] | undefined) => {
              // A bottle size belongs to one box type only — the checkout must not have to choose.
              const seen = new Set<number>()
              for (const group of groups ?? []) {
                for (const bottle of group.bottles ?? []) {
                  if (bottle.volume === undefined) continue
                  if (seen.has(bottle.volume)) {
                    return t.default(
                      'validation.volumeInOneGroup',
                      'Each bottle size may only be in one group',
                    )
                  }
                  seen.add(bottle.volume)
                }
              }
              return true
            }),
        }),
        // f('taxCategory', 'reference', {
        //   to: [{ type: 'taxCategory' }],
        //   validation: (Rule) => Rule.required(),
        // }),
        ctx.builders.priceField({
          name: 'freeShippingThreshold',
          validation: (Rule) => Rule.positive(),
          hidden: hiddenForPickup,
        }),
      ],
      preview: {
        select: {
          title: 'title',
          countries: 'eligibleCountries',
          methodType: 'methodType',
        },
        prepare({ title, countries, methodType }) {
          return {
            title: ctx.localizer.value(title),
            subtitle:
              methodType === 'pickup'
                ? ctx.schemaT.default('shippingMethod.preview.pickup', 'Pickup')
                : ctx.schemaT.default('shippingMethod.preview.countries', 'Countries', {
                    count: countries?.length || 0,
                  }),
          }
        },
      },
    }
  },
}
