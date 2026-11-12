# Studio credentials in a dataset secrets document; no Netlify account token

Status: accepted
Date: 2026-11-11 (implemented 2026-11-12)

## Context

An audit (2026-11-11) found three credentials in every customer's public Studio bundle: an
account-wide Netlify PAT (`SANITY_STUDIO_NETLIFY_ACCESS_TOKEN`), the shared functions secret and the
Vinofact token. The Studio is a public SPA: every `SANITY_STUDIO_*` var and anything in
`sanity.config.ts` is compiled into JS anyone can download; the Sanity login protects data, not
code. Netlify keeps every old deploy reachable at its permalink, so only rotation removes a leaked
value.

## Decision

- Values the Studio must send (`functionsSecret`, `netlifyBuildHook`, `vinofactToken`) go into the
  dataset via Sanity's **`@sanity/studio-secrets`** (`secrets.itsshops`, dotted id → logged-in
  members only), entered in an admin-only Integrations dialog.
- The Netlify PAT is **not used at all**: Deploy posts to a per-site **build hook** (can only start
  a build of one branch) and shows Netlify's public deploy-status badge.
- The server stays the guard: endpoints called with the shared secret validate everything (refunds
  load the PaymentIntent from the order, server-derived idempotency key).

Rejected: the PAT in the secrets document (every member and every Studio script could read an
account-wide token → the shop's server keys and deploying their own code); `sanity-plugin-netlify`
(stores a PAT in the dataset too, no Sanity 6 peer); a signed Netlify deploy notification writing a
status doc (a function + Netlify setting per site, still no cancel); per-user "action documents"
replacing the shared secret (more machinery than the leak needs — kept as a later option in the
plan).

## Consequences

- Every logged-in member, viewers included, can read the secrets (custom roles = Enterprise).
- Secrets are per dataset (`development` = staging, `production` = live) and part of every dataset
  export (backups).
- The Deploy button lost the "building" lock and cancel (the badge is an image). Upgrade path: a
  core-front server proxy with the PAT in server env.
- Sanity plans to deprecate the package once native server-side secrets exist (with a migration
  path) — one hook to swap.
- Plan with rollout and rotation: core-front `.claude/plans/studio-auth-and-security-hardening.md`.
