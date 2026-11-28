# Two country lists: the shop's countries vs. every country

**Status:** Active
**Date:** 2026-11-05

## Context

Core-back had one country list (`countryOptions`, Europe) for every country field. The website's
forms disagreed: core-front's registration form (and a shop's interest form) offer every ISO
country (`countryList`), so a person registering from outside Europe got a `customer` document whose
country the Studio showed as invalid. The European list itself was built from `countries-list`
(continent filter, emoji, currency) plus `i18n-iso-countries` (names), though only the code, the
name and — for the tax-country preview — the flag were read.

## Decision

- **Where a person lives** (customer account `address`, a customer's interest list): every
  country, `ctx.constants.allCountryOptions`.
- **What the shop sells/delivers to or is** (tax countries, shipping, order addresses
  `addressStrict`, shop address `businessAddress`): the shop's list, `countryOptions`. VAT for
  consumer goods follows the delivery country, so delivery stays restricted.
- Both lists: ISO codes + names from `Intl.DisplayNames` (same source as the website); the shop
  list is a fixed set of 52 European codes, the flag is computed (`flagEmoji`). `countries-list`
  dropped.
- Not changed now: the checkout billing address (could take every country — it only goes on the
  invoice); parked in handbook `plans/billing-address-all-countries.md` (wineNET question).

## Consequences

- Rule text: `architecture/plugin-and-config.md` → "Which country list". A new country field picks
  its list by that rule.
- Some shop-list names changed wording with the switch ("Tschechien", "Republik Moldau", "Czechia");
  stored codes are unchanged, no migration.
- A shop selling outside Europe would need a configurable shop list — not built until one does.

## Update (7.0.1, documented 2026-11-28)

- Order addresses (`addressStrict`, billing + shipping) moved to `allCountryOptions`: a store-pickup
  order's billing address may come from any country. The checkout still limits the shipping address
  to the tax countries, so "delivery stays restricted" holds.
- Billing address in the checkout: decided on 2026-11-28 to offer every country on delivery too and
  to require the wallet billing address in express checkout. It is a core-front-only change, see
  handbook `plans/billing-address-all-countries.md`.
